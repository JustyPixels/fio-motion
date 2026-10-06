import fs from 'node:fs';
const sources=[['src/i18n.ts','rows'],['src/i18n-extra.ts','extraRows'],['src/i18n-help.ts','helpRows']];
const languages=['en','pt-BR','es','fr','de','ja','zh-CN'],catalogs=Object.fromEntries(languages.map(l=>[l,{}]));
for(const [file,variable]of sources){const text=fs.readFileSync(file,'utf8'),table=text.split(`const ${variable}=\``)[1]?.split('`;')[0];if(!table)throw new Error('Missing catalog '+file);for(const row of table.trim().split('\n')){const cells=row.split('|');if(cells.length!==7||cells.some(c=>!c))throw new Error('Incomplete locale row: '+row);languages.forEach((l,i)=>catalogs[l][cells[0]]=cells[i]);}}
for(const key of Object.keys(catalogs.en))if(/^[a-z]+[A-Z]/.test(key))catalogs.en[key]=key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
fs.writeFileSync('src/locales.generated.json',JSON.stringify(catalogs,null,2)+'\n');
fs.writeFileSync('desktop/locales.json',JSON.stringify(catalogs,null,2)+'\n');
const titles=['Meet your little explorer','Give artwork a few controls','Make a pose, then another','Make the timing your own','Turn shots into a story'];
const bodies=['Press Space to play the sample wave. The artwork is split into layers, and the right arm already has a simple puppet rig.','Open Rig, select a layer, and choose Movement pin. Add an Anchor where the artwork should stay still. Drag movement pins to test the bend.','Open Animate and keep Auto-key enabled. Move the playhead, drag the hand pin, then play. Smooth easing is applied automatically.','Select a diamond on the timeline. Drag the timing-curve handles to change acceleration, or add spatial handles to bend the motion path.','Assemble puts your shots and audio on one timeline. When you are ready, export an MP4 or transparent PNG sequence.'];
fs.mkdirSync('docs/quick-start',{recursive:true});for(const l of languages)fs.writeFileSync(`docs/quick-start/${l}.md`,'# Fio Motion\n\n'+titles.map((title,i)=>`## ${i+1}. ${catalogs[l][title]}\n\n${catalogs[l][bodies[i]]}\n`).join('\n'));
console.log(`Generated ${Object.keys(catalogs.en).length} messages in seven languages and offline guides.`);
