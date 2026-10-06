export const repository = 'JustyPixels/fio-motion';
export const releaseRoot = `https://github.com/${repository}/releases`;
const names = {installer:['-x64.exe','Windows installer','Install Fio Motion on this computer'],portable:['-x64-portable.exe','Portable version','Run without installing'],support:['-support.zip','Examples & guides','Sample characters, offline guides and compatibility notes'],checksums:[null,'SHA256 checksums','Verify the downloaded files']};
export function releaseManifest(release) {
  if (!release || release.draft || !/^v?\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(release.tag_name) || !Number.isFinite(Date.parse(release.published_at))) throw new Error('Invalid published release.');
  const version = release.tag_name.replace(/^v/,'');
  if (release.html_url !== `${releaseRoot}/tag/${release.tag_name}`) throw new Error('Unexpected release destination.');
  const assets = Object.entries(names).map(([id,[suffix,label,description]]) => {
    const name=id==='checksums'?`SHA256SUMS-${version}.txt`:`Fio-Motion-${version}${suffix}`;
    const asset=release.assets?.find(a=>a.name===name);
    const url=`${releaseRoot}/download/${release.tag_name}/${name}`;
    if(!asset||asset.state!=='uploaded'||asset.browser_download_url!==url||!Number.isSafeInteger(asset.size)||asset.size<=0||!/^sha256:[a-f0-9]{64}$/.test(asset.digest??''))throw new Error(`Missing or invalid ${id} asset in ${release.tag_name}.`);
    return {id,name,label,description,url,bytes:asset.size,sha256:asset.digest.slice(7)};
  });
  return {version,tag:release.tag_name,prerelease:release.prerelease===true,publishedAt:release.published_at,url:release.html_url,unsigned:version==='1.0.0-rc.1'||/\bunsigned\b/i.test(release.body??''),assets};
}
export function validateManifest(manifest) {
  const raw={tag_name:manifest.tag,prerelease:manifest.prerelease,published_at:manifest.publishedAt,html_url:manifest.url,assets:manifest.assets.map(a=>({name:a.name,state:'uploaded',browser_download_url:a.url,size:a.bytes,digest:'sha256:'+a.sha256}))};
  const checked=releaseManifest(raw);
  if(checked.version!==manifest.version||manifest.assets.length!==4)throw new Error('Invalid fallback manifest.');
  return {...checked,unsigned:manifest.unsigned===true};
}
export function newestCandidate(releases) {
  const candidates=releases.filter(r=>!r.draft&&r.prerelease&&Number.isFinite(Date.parse(r.published_at))).sort((a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at));
  if(!candidates.length)throw new Error('No published stable release or candidate exists.');
  return candidates[0];
}
export async function fetchManifest(request=fetch) {
  async function get(path,allow404=false){const response=await request(`https://api.github.com/repos/${repository}/${path}`,{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(process.env.GITHUB_TOKEN?{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`}:{})},signal:AbortSignal.timeout(15000)});if(allow404&&response.status===404)return null;if(!response.ok)throw new Error(`GitHub release request failed (${response.status}).`);return response.json();}
  const stable=await get('releases/latest',true);
  if(stable){if(stable.prerelease)throw new Error('Stable endpoint returned a candidate.');return releaseManifest(stable);}
  const releases=[];
  for(let page=1;;page++) {
    const batch=await get(`releases?per_page=100${page===1?'':`&page=${page}`}`);
    if(!Array.isArray(batch))throw new Error('Invalid release list.');
    releases.push(...batch);
    if(batch.length<100)break;
  }
  return releaseManifest(newestCandidate(releases));
}
