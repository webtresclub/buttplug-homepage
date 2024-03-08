import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./src/lib/data.json', 'utf8'));

const types = {}
Object.keys(data).forEach((k) => {
  const item = data[k];
  item.attributes.forEach((attr) => {
    types[attr.trait_type] = types[attr.trait_type] || {};
    types[attr.trait_type][attr.value] = types[attr.trait_type][attr.value] || [];
    types[attr.trait_type][attr.value].push(k);
  });
})

fs.writeFileSync('./src/lib/attributes-group.json', JSON.stringify(types, null, 2));



