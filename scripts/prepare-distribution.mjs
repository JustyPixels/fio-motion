import fs from 'node:fs';
const config=JSON.parse(fs.readFileSync('desktop/release-config.json','utf8'));
fs.mkdirSync('release/distribution',{recursive:true});
for(const file of ['README.md','README.pt-BR.md'])fs.copyFileSync(file,'release/distribution/'+file);
fs.mkdirSync('release/distribution/.github/ISSUE_TEMPLATE',{recursive:true});fs.writeFileSync('release/distribution/.github/ISSUE_TEMPLATE/bug.yml',`name: Report a problem\ndescription: Help improve Fio Motion\nbody:\n  - type: input\n    id: version\n    attributes:\n      label: Fio Motion version\n    validations:\n      required: true\n  - type: textarea\n    id: reproduce\n    attributes:\n      label: Steps to reproduce and expected result\n    validations:\n      required: true\n  - type: textarea\n    id: system\n    attributes:\n      label: Windows version and GPU\n`);
console.log(`Prepared distribution repository content for ${config.owner}/${config.repository}. Application source lives in the repository; these files prepare its download guide and issue form.`);
