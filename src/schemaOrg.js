import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export default class SchemaOrg {
    constructor() {
        this.schema = null;
    }

    stripSchema(name) {
        if (name.startsWith('schema:')) {
            return name.replace('schema:', '');
        }
        return name;
    }

    async loadSchema() {
        let rawSchema = await readFile(join(process.cwd(), 'gallery/schemaorg-current-https.jsonld'), 'utf8');
        rawSchema = JSON.parse(rawSchema);

        const schema = {};

        // Get all types
        const entites = rawSchema['@graph'];
        entites.filter((entity) => entity['@type'] === 'rdfs:Class').forEach((type) => {
            const name = this.stripSchema(type['@id']);
            schema[name] = {
                properties: [],
                propertiesFromParent: {},
            }
            if (Array.isArray(type['rdfs:subClassOf'])) {
                schema[name].parents = type['rdfs:subClassOf'].map((parent) => this.stripSchema(parent['@id']));
            } else if (type['rdfs:subClassOf']) {
                schema[name].parents = [this.stripSchema(type['rdfs:subClassOf']['@id'])];
            }
        });

        // Add all properties to types
        entites.filter((entity) => entity['@type'] === 'rdf:Property').forEach((property) => {
            const domainIncludes = property['schema:domainIncludes'];
            const types = Array.isArray(domainIncludes) ? domainIncludes.map(domain => this.stripSchema(domain['@id']))
                : domainIncludes ? [this.stripSchema(domainIncludes['@id'])]
                    : [];
            types.forEach((type) => {
                if (schema[type]) {
                    schema[type].properties.push(this.stripSchema(property['@id']));
                }
            });
        });


        // Sort properties for each type alphabetically
        Object.keys(schema).forEach((type) => {
            schema[type].properties.sort();
        });


        // Add inherited properties
        const processOrder = this.getTopologicalOrder(schema);
        this.addInheritedProperties(schema, processOrder);

        // TODO: Temporarily write this to a file
        await writeFile(join(process.cwd(), 'gallery/schemaorg-current-types.json'), JSON.stringify(schema, null, 2));

        this.schema = schema;
    }

    getTopologicalOrder(schema) {
        const visited = new Set();
        const temp = new Set();  // For cycle detection
        const order = [];

        // Helper function for DFS
        const visit = (typeId) => {
            if (temp.has(typeId)) {
                throw new Error('Cyclic inheritance detected');
            }
            if (visited.has(typeId)) {
                return;
            }

            temp.add(typeId);

            const type = schema[typeId];
            if (type && type.parents) {
                // Visit all parents before this type
                for (const parentId of type.parents) {
                    if (schema[parentId]) {
                        visit(parentId);
                    }
                }
            }

            temp.delete(typeId);
            visited.add(typeId);
            order.push(typeId);
        };

        // Process all types
        Object.keys(schema).forEach(typeId => {
            if (!visited.has(typeId)) {
                visit(typeId);
            }
        });

        return order;
    }

    addInheritedProperties(schema, processOrder) {
        processOrder.forEach(typeId => {
            const type = schema[typeId];
            if (type.parents && type.parents.length > 0) {
                // Process each parent
                for (const parentId of type.parents) {
                    if (schema[parentId]) {
                        // Add direct properties from this parent
                        type.propertiesFromParent[parentId] = [
                            ...schema[parentId].properties,
                        ];

                        // Add inherited properties from this parent's ancestors
                        Object.keys(schema[parentId].propertiesFromParent).forEach((ancestorId) => {
                            if (!type.propertiesFromParent[ancestorId] && schema[parentId].propertiesFromParent[ancestorId].length > 0) {
                                type.propertiesFromParent[ancestorId] = schema[parentId].propertiesFromParent[ancestorId];
                            }
                        });
                    }
                }
            }
        });
    }

    async validateProperty(type, property) {
        if (!this.schema) {
            await this.loadSchema();
        }

        // Check if type exists
        if (!this.schema[type]) {
            return false;
        }

        // Check if property is directly supported
        if (this.schema[type].properties.includes(property)) {
            return true;
        }

        // Check if property is supported through inheritance
        return Object.keys(this.schema[type].propertiesFromParent).some((parent) => {
            return this.schema[type].propertiesFromParent[parent].includes(property);
        });
    }
}