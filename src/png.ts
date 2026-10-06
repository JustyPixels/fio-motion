import {zlibSync} from 'fflate';
const table=Uint32Array.from({length:256},(_,value)=>{for(let bit=0;bit<8;bit++)value=value&1?0xedb88320^(value>>>1):value>>>1;return value>>>0;});
function chunk(type:string,data:Uint8Array){const bytes=new Uint8Array(data.length+12),view=new DataView(bytes.buffer);view.setUint32(0,data.length);for(let i=0;i<4;i++)bytes[4+i]=type.charCodeAt(i);bytes.set(data,8);let crc=0xffffffff;for(let i=4;i<bytes.length-4;i++)crc=table[(crc^bytes[i])&255]^(crc>>>8);view.setUint32(bytes.length-4,(crc^0xffffffff)>>>0);return bytes;}
// Video frames are opaque. Light compression avoids the expensive browser PNG
// filtering pass while retaining the existing validated image stream protocol.
export function encodeRgbaPng(width:number,height:number,rgba:Uint8Array,bottomUp=false){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||rgba.length!==width*height*4)throw new Error('Invalid video frame.');
  const stride=width*4,rows=new Uint8Array((stride+1)*height);for(let y=0;y<height;y++){const source=(bottomUp?height-1-y:y)*stride;rows.set(rgba.subarray(source,source+stride),y*(stride+1)+1);}
  const header=new Uint8Array(13),view=new DataView(header.buffer);view.setUint32(0,width);view.setUint32(4,height);header[8]=8;header[9]=6;const pieces=[new Uint8Array([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlibSync(rows,{level:1})),chunk('IEND',new Uint8Array())],png=new Uint8Array(pieces.reduce((n,p)=>n+p.length,0));let offset=0;for(const piece of pieces){png.set(piece,offset);offset+=piece.length;}return png;
}
