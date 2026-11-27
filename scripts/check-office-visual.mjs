// CI-only browser check with synthetic data; real Three.js renderer.
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
 const browser=await engine.launch({headless:true,...(name==='desktop'?{args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}: {})})
 try{
  const page=await browser.newPage(options),errors=[]
  page.on('pageerror',error=>errors.push(error.message))
  page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())})
  await page.goto(base,{waitUntil:'networkidle',timeout:60000})
  await page.getByRole('heading',{name:'Factory.'}).waitFor()
  await page.waitForFunction(()=>['webgl','fallback'].includes(document.querySelector('.studio-viewport')?.dataset.renderer),{},{timeout:30000})
  const renderer=await page.locator('.studio-viewport').getAttribute('data-renderer')
  assert.equal(renderer,'webgl',name+' must render actual 3D in the CI browser')
  if(renderer==='webgl'){
   await page.waitForFunction(()=>Array.from(document.querySelectorAll('.studio-seat')).some(el=>el.style.visibility==='visible'))
   assert.equal(await page.locator('[data-seat]').count(),9)
  assert.equal(await page.locator('[data-treasury]').getAttribute('data-coins'),'13')
  await page.locator('[data-treasury]').click({force:true})
  assert.match(await page.locator('.studio-quota-detail').innerText(),/65% · demo/)
  await page.getByRole('button',{name:'Cerrar cuota'}).click()
   await page.locator('[data-seat="sno_qa"]').click({force:true})
  }else{await page.locator('.studio-fallback button').filter({hasText:'QA'}).click()}
  assert.match(await page.locator('.studio-selection').innerText(),/QA/)
  assert.match(await page.locator('.studio-selection a').getAttribute('href'),/agent=sno_qa$/)
  await page.getByRole('button',{name:'Cerrar selección'}).click()
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true)
  await page.screenshot({path:'office-screenshots/'+name+'-demo.png'})
  await page.goto(base+'?mode=telemetry',{waitUntil:'networkidle',timeout:60000})
  await page.getByText('Pausada · cuota',{exact:true}).waitFor()
  assert.equal(await page.locator('[data-seat="orchestrator"]').getAttribute('data-status'),'paused')
  assert.equal(await page.locator('[data-seat="sno_qa"]').getAttribute('data-status'),'observed')
  assert.equal(await page.locator('[data-status="working"]').count(),0)
  assert.equal(await page.locator('[data-treasury]').getAttribute('data-kind'),'blocked')
  assert.equal(await page.locator('[data-treasury]').getAttribute('data-coins'),'0')
  await page.waitForFunction(()=>['webgl','fallback'].includes(document.querySelector('.studio-viewport')?.dataset.renderer),{},{timeout:30000})
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),true)
  assert.deepEqual(errors,[])
  await page.screenshot({path:'office-screenshots/'+name+'-telemetry.png'})
  console.log(name+': renderer='+renderer+'; agent selection, pause, overflow and console checks OK')
 }finally{await browser.close()}
}
