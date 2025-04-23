import { Validator } from './validator.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

(async () => {
  const __dirname = import.meta.dirname;
  // const rdfaExample = await readFile(join(__dirname, '../gallery/breadcrumb/rdfa-valid1.html'), 'utf8');
  //const microdataExample = await readFile(join(__dirname, '../gallery/breadcrumb/microdata-valid1.html'), 'utf8');
  /* const ldjsonExample = `<script type="application/ld+json">
        ${await readFile(join(__dirname, '../gallery/breadcrumb/invalid1.json'), 'utf8')}
    </script>`; */

  const waeExample = await readFile(
    join(__dirname, '../gallery/scrape-new1.json'),
    'utf8',
  );

  const validator = new Validator();

  const results = await validator.validate(
    JSON.parse(waeExample).scrapeResult.structuredData,
  );

  console.log(JSON.stringify(results, null, 2));
})();
