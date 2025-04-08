import { Validator } from './validator.js';
import WebAutoExtractor from '@marbec/web-auto-extractor';
import { readFile } from 'fs/promises';
import { join } from 'path';

(async () => {
  const __dirname = import.meta.dirname;
  // const rdfaExample = await readFile(join(__dirname, '../gallery/breadcrumb/rdfa-valid1.html'), 'utf8');
  //const microdataExample = await readFile(join(__dirname, '../gallery/breadcrumb/microdata-valid1.html'), 'utf8');
  const ldjsonExample = `<script type="application/ld+json">
        ${await readFile(join(__dirname, '../gallery/breadcrumb/invalid1.json'), 'utf8')}
    </script>`;

  const {
    //microdata,
    // rdfa,
    jsonld,
  } = new WebAutoExtractor({ addLocation: true }).parse(ldjsonExample);

  const validator = new Validator();

  // const data = await validator.parse('gallery/breadcrumb/invalid1.json');
  const issues = await validator.validate(jsonld, 'jsonld');

  console.log(JSON.stringify(issues, null, 2));
})();
