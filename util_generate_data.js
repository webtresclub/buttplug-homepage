import fs from 'fs';

const output = {};
for (let i = 1; i < 1025; i++) {
	const name = `00000${i}`;
	const file = `./static/data/${name.slice(-4)}.json`;
	const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
	output[i] = raw;
}

fs.writeFileSync('./src/lib/data.json', JSON.stringify(output, null, 2));
