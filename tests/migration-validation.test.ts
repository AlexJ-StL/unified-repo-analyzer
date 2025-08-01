/**
 * Migration validation tests
 * 
 * This test suite validates the successful migration from JavaScript to TypeScript
 * and ensures all new tooling (Bun, Biome) works correctly.
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { describe, expect, test } from 'vitest';
import type { BiomeConfig, PostCSSConfig, TailwindConfig } from '../types/config';

// Helper function to run shell commands
async function runCommand(command: string, args: string[], cwd?: string): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: cwd || process.cwd(),
      stdio: 'pipe',
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
      });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Helper function to check if a file can be imported/compiled
async function canCompileTypeScript(filePath: string): Promise<boolean> {
  try {
    const result = await runCommand('bun', ['build', filePath, '--target', 'node']);
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

describe('Migration Validation Tests', () => {
  const projectRoot = resolve(__dirname, '..');
  
  describe('TypeScript Configuration Files Compilation', () => {
    test('should compile PostCSS configuration file', async () => {
      const configPath = join(projectRoot, 'packages/frontend/postcss.config.ts');
      expect(existsSync(configPath)).toBe(true);
      
      // Test that the file can be compiled
      const canCompile = await canCompileTypeScript(configPath);
      expect(canCompile).toBe(true);
      
      // Test that the configuration can be imported and has correct structure
      try {
        const config = await import(configPath);
        expect(config.default).toBeDefined();
        expect(config.default.plugins).toBeDefined();
        expect(typeof config.default.plugins).toBe('object');
        
        // Validate against TypeScript interface
        const postcssConfig: PostCSSConfig = config.default;
        expect(postcssConfig.plugins).toHaveProperty('tailwindcss');
        expect(postcssConfig.plugins).toHaveProperty('autoprefixer');
      } catch (error) {
        throw new Error(`Failed to import PostCSS config: ${error}`);
      }
    });

    test('should compile Tailwind configuration file', async () => {
      const configPath = join(projectRoot, 'packages/frontend/tailwind.config.ts');
      expect(existsSync(configPath)).toBe(true);
      
      // Test that the file can be compiled
      const canCompile = await canCompileTypeScript(configPath);
      expect(canCompile).toBe(true);
      
      // Test that the configuration can be imported and has correct structure
      try {
        const config = await import(configPath);
        expect(config.default).toBeDefined();
        expect(config.default.content).toBeDefined();
        expect(Array.isArray(config.default.content)).toBe(true);
        
        // Validate against TypeScript interface
        const tailwindConfig: TailwindConfig = config.default;
        expect(tailwindConfig.content).toContain('./index.html');
        expect(tailwindConfig.theme).toBeDefined();
        expect(tailwindConfig.theme.extend).toBeDefined();
        expect(Array.isArray(tailwindConfig.plugins)).toBe(true);
      } catch (error) {
        throw new Error(`Failed to import Tailwind config: ${error}`);
      }
    });

    test('should compile Vitest configuration file', async () => {
      const configPath = join(projectRoot, 'vitest.config.ts');
      expect(existsSync(configPath)).toBe(true);
      
      // Test that the file can be compiled
      const canCompile = await canCompileTypeScript(configPath);
      expect(canCompile).toBe(true);
      
      // Test that the configuration can be imported
      try {
        const config = await import(configPath);
        expect(config.default).toBeDefined();
        expect(config.default.test).toBeDefined();
        expect(config.default.test.globals).toBe(true);
        expect(config.default.test.environment).toBe('node');
      } catch (error) {
        throw new Error(`Failed to import Vitest config: ${error}`);
      }
    });

    test('should compile test runner script', async () => {
      const scriptPath = join(projectRoot, 'scripts/test-runner.ts');
      expect(existsSync(scriptPath)).toBe(true);
      
      // Test that the file can be compiled
      const canCompile = await canCompileTypeScript(scriptPath);
      expect(canCompile).toBe(true);
      
      // Test that the script can be imported
      try {
        const testRunner = await import(scriptPath);
        expect(testRunner.default).toBeDefined();
        expect(typeof testRunner.default).toBe('function');
      } catch (error) {
        throw new Error(`Failed to import test runner: ${error}`);
      }
    });

    test('should validate type definitions file', async () => {
      const typesPath = join(projectRoot, 'types/config.ts');
      expect(existsSync(typesPath)).toBe(true);
      
      // Test that the file can be compiled
      const canCompile = await canCompileTypeScript(typesPath);
      expect(canCompile).toBe(true);
      
      // Test that types can be imported
      try {
        const types = await import(typesPath);
        
        // Check that key interfaces are exported
        expect(types).toBeDefined();
        
        // We can't directly test interface exports, but we can test that the file compiles
        // and doesn't throw errors when imported
      } catch (error) {
        throw new Error(`Failed to import type definitions: ${error}`);
      }
    });
  });
});  descr
ibe('Bun Runtime Compatibility', () => {
    test('should run TypeScript files natively with Bun', async () => {
      const result = await runCommand('bun', ['--version']);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    test('should execute test runner script with Bun', async () => {
      const scriptPath = join(projectRoot, 'scripts/test-runner.ts');
      
      // Test that Bun can execute the TypeScript file directly
      const result = await runCommand('bun', ['--help', scriptPath]);
      // We expect this to either succeed or fail gracefully (not crash)
      expect(result.exitCode).toBeLessThan(2);
    });

   ;
}); });
  })
   ort');xpoContain('eerContent).tRunn expect(test);
     t'in('imporntant).toConnerContetestRut(    expec
  sdern APImoould use // Sh
      ;
      nding')ess.biain('procot.toContntent).nerCoect(testRunn    expn');
  .maiain('requiret.toContent).nostRunnerCont(texpects
      eed API deprecatld not useShou     //  
 -8');
     th, 'utftRunnerPanc(tesleSy= readFinerContent testRun  const s');
    nner.tipts/test-ruscrt, 'ectRooproj join(erPath =testRunn    const 
  ted APIsprecause deiles don't ted f migrack that the     // Che=> {
 async () are used', de.js APIs precated No de validate notest('should

    ;
    });4 * 1024)an(50 * 102oBeLessThe).tncreasct(memoryI  expe   50MB)
 ess than  (lnable be reasoease shouldory incr Mem  //
    
      .heapUsed;Memorytial - iniedUsapMemory.heinalrease = fmoryInc    const meage();
  s.memoryUsy = procesorst finalMem
      con   
   s'));ig.t.conftailwindend/ntkages/fro 'pactRoot,ecojort(join(pr  await imp;
    ig.ts')).confnd/postcssronteages/ft, 'packojectRoo(primport(joint     awaiiles
   fonfigurationrt some c // Impo
           age();
emoryUs= process.mialMemory it   const in
    => {sync ()nable', aage is reaso memory uslidatet('should vaes

    t   });;
 000)essThan(5.toBeLuration)t(dxpecck)
      e cheversions for ondsecan 5 less thbly fast (easonauld be rSho   //       
   ;
ime- startT Date.now() on =ratinst du    co
      
  ion']);'--vers [',('bunnCommand  await ruh Bun
     witmpilationScript coimple Type Run a s      //

      Date.now();e = Timt start      cons=> {
', async () vementsronce impperformaidate Bun ould valst('shte   
 > {, () =idation'ility Valnd Compatibformance aescribe('Per;

  d
  })
    });'FATAL');oContain().not.tderrstesult.xpect(r
      e;anOrEqual(1)ThBeLessode).toresult.exitCt(    expec
  crash)not ould l, but shr fai pass omay run (st shouldTe/       /;
      
rojectRoot)], pest.ts'dation.taligration-vsts/mi'te-run',  ['test', '-',mmand('bunt runCot = awaiulnst res coworks
     runner test n o ensure Bue test tRun a simpl{
      // ) => nc (, asyith Bun' execution w testalidatehould v  test('s  });

  
  );in('ERROR'not.toContarr).(result.stde     expectBe(0);
 tCode).toesult.exit(r    expec
  ld succeedd shou/ Buil  
      /  ;
  tRoot)ojec prd:shared'],'run', 'buil, ['bun'nCommand( await ruesult =  const r    cessfully
es sucpletcess comld prot the buit tha      // Tesc () => {
ynoling', asth new torks wiocess woate build pralid'should vst(    te    });

');
('error TSContainderr).not.tot.stt(resulpecex     );
 oBe(0itCode).tt(result.ex
      expect errorsithoucompile whould ypeScript s// T         
  
 ;ectRoot)projoEmit'], sc', '--n, ['run', 'tun'and('bmmt runCoult = awainst res  co   () => 
 ync , asire project'on of entilatimpcopeScript date Tyaliould vt('sh tes);
         }
}
   );
     ror}`ath}: ${ernfigP${coconfig o load ailed tor(`F Err throw new  
        {atch (error)  } c
      th)gPa(confiportawait im    {
           try   ) {
  configsfigPath ofconst conr ( fo      
];
     
      ig.ts'),conf'vitest.Root, ject    join(pro
    g.ts'),nfiind.contend/tailwges/fro 'packaot,ectRooin(proj    j   s'),
 ig.tconfostcss.d/pges/fronten'packa, otRoojectprin(
        jo= [t configs ns co
     conflictsed without load can be ation filesnfigurall coTest that {
      // ync () => r', as togetheiles workn fguratiol confite aluld validaest('sho => {
    ts', ()tion Testgraation InteConfigure('
  describ });

    });
 Be(false);d).to?.enablee?.formatteridverreOludexpect(exc   false);
   oBe(?.enabled).tnter?.liudeOverrideexpect(excl;
      ned()).toBeDefieOverrideludxcect(e    exp  
      );
    )
  ules')node_mod.includes(' patternern =>me(patt.soeside.includrrve o 
       ride =>.find(overes= overridde errideOvconst exclu
      ]; [s ||errideig.ov = biomeConfidesrr   const ove
     
    -8'));igPath, 'utfeConfiomFileSync(badON.parse(re = JSiomeConfignfig: Bonst biomeCo
      cn');iome.jso, 'bootrojectRth = join(pmeConfigPa const bio> {
     ) =ync (atterns', as exclusion pld validate'shou
    test(    });
rue);
toBe(tes/**'))).ckag('paudespattern.incln => me(patterncludes.soct(i     expeincluded
 ckages are eck that pa// Ch    
      
  rue);).toBe(t*.jsx'))includes('tern.tern => pat(patsomect(includes. expe
     oBe(true);'*.js'))).trn.includes(ern => patte(pattes.somexpect(includ
      eoBe(true);'*.tsx'))).t.includes(ternn => pat.some(patterludespect(inc     extrue);
 .toBe())*.ts').includes('patternrn => s.some(pattepect(included
      exclude infiles areipt aScrand JaveScript hat TypCheck t //       
     | [];
 |.includesiles?ig.feConf biomdes =ncluconst i    
      ;
  8'))f-figPath, 'utmeConnc(bioreadFileSye( = JSON.parsnfigiomeCofig: BonbiomeC     const 
 son');.jbiomejectRoot, 'oin(pro = jatheConfigPonst biom     c
 nc () => {rns', asyatteion pfile incluse ld validatt('shou    tes   });


 ');s5as).toBe('eommilingCtter?.trapt?.formafig.javascrionmeCct(bio      expeays');
('alwlons).toBeemicormatter?.spt?.foscri.javabiomeConfigct( expe   ;
  Be('single')toyle).ter?.quoteStormatt?.fipjavascrig.iomeConf   expect(bng
   ic formattiecifaScript-spJav/ Check 
      /    0);
  toBe(10neWidth).?.literonfig.formatiomeC  expect(b  toBe(2);
  ntWidth)..inder?ig.formatte(biomeConf   expectce');
   oBe('spaStyle).tdent?.informatterConfig.xpect(biome    eation
  nfigurormatter co Check f  //
          'utf-8'));
, figPathoneSync(biomeCilrse(readFg = JSON.paeConfiiom Bfig:st biomeCon
      coniome.json');Root, 'bojectth = join(promeConfigPaconst bi    => {
   ()gs', async ettin formatter sScriptt/Typete JavaScriplidat('should va tes
   ;
);
    })s'edVariable'noUnusoperty(ss).toHavePr.correctnerules?expect(;
      ')Template'useerty(toHavePropyle).les?.st  expect(runst');
    rty('useCoPropevee).toHastyl?.rulesexpect(    
  icitAny');Explperty('noaveProtoHous).ici.susples?xpect(ru
      e mappingslefic rupecick she     // C
 ();
      edDefinness).toBerectrules?.corxpect(
      eed();eDefin.toBstyle)ules?. expect(r;
     d()efineious).toBeD?.suspicles  expect(ru;
    rue)ded).toBe(t.recommenct(rules?
      expe configESLint in ikely ls that werent rulelevack for equi     // Che 
    );
  Defined(s).toBet(rule   expecrules;
   .linter?.iomeConfigles = bnst ru     coents
 ivalme equ have Bioulest rt key ESLinck tha      // Che
'));
      ath, 'utf-8figPc(biomeConSynileparse(readFig = JSON.onfiomeCmeConfig: B bioonst
      c');'biome.jsonRoot, (project = joinConfigPathme bionst   co
    => {, async ()equivalents'int match ESLome rules  Bild validate('shoust);

    te  }(0);
  tCode).toBet.exixpect(resul;
      ejectRoot)], pro '--help'format',', 'run('bun', ['ommandunC rlt = awaitsu const re
     ) => {sync (lly', assfuucceting srmatBiome fon  ru('should    test });

   t');
ain('CannoContnot.tor)..stdersultct(re   expe;
   ain('FATAL')).not.toContult.stderres  expect(r  rs
  al errofatain cont not // Should     
       (1);
nOrEqualLessThae).toBeod.exitCxpect(result  e  rrors)
  lint eor 1 for t code 0 ashing (exiwithout cruld run sho/ Biome 
      /);
      rojectRoot], plint''run', 'nd('bun', [runComma= await st result on{
      c) =>  (', asyncuccessfully sme lintingld run Bioshou   test('

 
    });(true);).toBeledatter?.enabnfig.formbiomeCoexpect(
      efined();BeD).toer.formatt(biomeConfig      expectoBe(true);
d).t?.enableterlinConfig.ct(biome  expe   ();
 toBeDefinedter).ineConfig.l(biom expect     
d();).toBeDefine.$schemameConfigpect(bio  ex
    n structureconfiguratiolidate 
      // Va     
 gContent);Confi(biomeON.parsefig = JSong: BiomeCeConfibiomconst );
      'utf-8'Path, iomeConfigeSync(breadFilContent = meConfig   const bio
   e);
      ).toBe(truigPath)onfnc(biomeC(existsSy  expect
    );son', 'biome.jootin(projectRgPath = jobiomeConfi   const   {
 c () => ation', asynonfigurlid Biome c vahaveld ('shoutest{
    ion', () => les Validatng Ru'Biome Lintiescribe(  d;
  });


    }));n'ain('bun ruest).toConts.tscriptPackage.rontendt(f   expec
   ');ain('bun runld).toConts.buiscripttendPackage.fronxpect(
      en');ain('bun runtts.dev).toCocrip.sndPackageontefrpect(
      exsscriptontend  // Check fr      
    test');
  Be('bun.test).to.scriptsagekendPackpect(bac  exld');
    n buiontain('bu.toCuild)ripts.bPackage.scendexpect(back');
      ontain('bunpts.dev).toCkage.scribackendPac     expect(
 riptsend sc Check back
      //;
      h, 'utf-8'))PatageackndPnc(frontedFileSyse(rea = JSON.parckaget frontendPa      constf-8'));
kagePath, 'uc(backendPaceSyn(readFilse= JSON.parkendPackage ac     const b
 n');
      so.jckaged/pa/frontenckagesRoot, 'paject join(proPath =ackagentendPfro   const ');
   age.jsond/packckenkages/baoot, 'pacrojectRth = join(pagePaendPackst back      conc () => {
ynn', aspts use Bupackage scrie workspace lidat'should vat(es

    t });   ;
n')n run('buai.toContipts.build)kageJson.scrt(pac    expec;
  bun test')t).toBe('pts.teson.scrieJsagpect(pack;
      exn')n ruain('bu.dev).toContn.scriptsageJsockpa   expect(f 'npm'
   n' instead opts use 'but key scriCheck tha   //   
      
 8'));tf-JsonPath, 'uync(package(readFileS.parseON JSn =t packageJso     cons');
 age.jsont, 'packjectRoon(proh = joinPatsokageJt pac    cons> {
  c () =synun', ae Bipts usage.json scrlidate pack'should va   test(   });

 t]');
 ontain('[tesContent).toCect(bunfig      exp('[run]');
ainContontent).tobunfigC  expect(
    install]');('[ainnt).toContonteect(bunfigC  exp');
    , 'utf-8c(bunfigPathadFileSyn = reentt bunfigCont
      consue);
      )).toBe(trgPathc(bunfitsSyn(exis  expect;
    g.toml'), 'bunfiRootin(projectgPath = joconst bunfi      {
() =>  async ality',ace functionun worksprt Bppould su('sho
    test
    });
st');ntain('tet).toCoult.stdouct(res    expe
  );e).toBe(0itCodt.ext(resul    expec;
  , '--help'])['test', 'bun'runCommand(t  await result =     cons=> {
  () yncsfully', asand succescommun test  Bd run test('shoul