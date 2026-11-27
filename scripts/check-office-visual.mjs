// CI-only browser check of actual Office components, with synthetic props.
import {strict as assert} from 'node:assert'
import {mkdir} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
const {chromium,webkit}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href)
const base='http://127.0.0.1:3019/factory-office-ci'
await mkdir('office-screenshots',{recursive:true})
for(const [name,engine,options] of [
 ['desktop',chromium,{viewport:{width:1440,height:1000},deviceScaleFactor:1}],
 ['mobile',webkit,{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}]
]){
 const browser=await engine.launch({headless:true})
 try{
  const page=await browser.newPage(options),errors=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto(base,{waitUntil:'networkidle',timeout:60000})
  await page.getByRole('heading',{name:'Oficina de agentes.'}).waitFor()
  await page.waitForFunction(()=>{const c=document.querySelector('canvas');return c?.getContext('2d')?.getImageData(50,100,1,1).data[3]===255})
  assert.equal(await page.locator('.fo-roster button').count(),8)
  await page.locator('.fo-roster button').filter({hasText:'Seguridad'}).click()
  assert.equal(await page.locator('.fo-inspector code').innerText(),'sno_seguridad')
  await page.locator('#fo-task').selectOption('2')
  assert.match(await page.locator('.fo-inspector').innerText(),/Revisión de seguridad/)
  assert.match(await page.getByRole('status').innerText(),/MODO DEMO/)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true)
  await page.screenshot({path:'office-screenshots/'+name+'-demo.png',fullPage:true})
  await page.goto(base+'?mode=telemetry',{waitUntil:'networkidle',timeout:60000})
  await page.getByText('Interrumpido por cuota',{exact:true}).waitFor()
  assert.match(await page.locator('.fo-observations').innerText(),/Subagente 2/)
  assert.match(await page.locator('.fo-observations').innerText(),/Rol no informado/)
  await page.locator('.fo-roster button').filter({hasText:'QA'}).click()
  assert.equal(await page.locator('.fo-inspector code').innerText(),'sno_qa')
  assert.match(await page.locator('.fo-inspector a').first().getAttribute('href'),/agent=sno_qa$/)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true)
  assert.deepEqual(errors,[])
  await page.screenshot({path:'office-screenshots/'+name+'-telemetry.png',fullPage:true})
  console.log(name+': canvas, selection, telemetry, mobile overflow and console checks OK')
 }finally{await browser.close()}
}
