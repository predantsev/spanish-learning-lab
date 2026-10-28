import json,re,hashlib
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'contracts'
repo=Path(__file__).resolve().parents[2]
def obj(props,req=None): return {'type':'object','additionalProperties':False,'properties':props,'required':list(props) if req is None else req}
def arr(item,lo=0,hi=100): return {'type':'array','items':item,'minItems':lo,'maxItems':hi}
def st(n=1000,lo=1): return {'type':'string','minLength':lo,'maxLength':n}
def enum(*v):return {'type':'string','enum':list(v)}
def ref(n):return {'$ref':'#/$defs/'+n}
I={'type':'integer','minimum':0,'maximum':9007199254740991}
B={'type':'boolean'}
D={}
D['Id']={'type':'string','format':'uuid'}
D['Hash']={'type':'string','pattern':'^[a-f0-9]{64}$'}
D['Snapshot']={'type':'string','pattern':'^[A-Za-z0-9_-]{43}$'}
D['Time']={'type':'string','format':'date-time'}
D['Date']={'type':'string','format':'date'}
D['Target']=obj({'skillId':{'type':'string','pattern':'^[a-z0-9][a-z0-9._-]{1,119}$'},'modality':enum('written-form','context-choice','reading-meaning','listening-meaning','dictation','phrase-recall','construction-use')})
D['Ref']=obj({'id':ref('Id'),'revision':I,'resourceType':enum('context','draft','attempt','support','practice-set','phrase','material','collection','review','content','profile','preference','session','lesson-progress','timezone-preview','token','export','upload','restore-preview')})
D['Block']={'oneOf':[
obj({'type':{'const':'paragraph'},'language':enum('uk','es-ES'),'text':st(2000)}),
obj({'type':{'const':'bullet-list'},'language':enum('uk','es-ES'),'items':arr(st(500),1,12)}),
obj({'type':{'const':'example'},'spanish':st(1000),'ukrainian':st(1000)}),
obj({'type':{'const':'practice-link'},'labelUk':st(120),'targets':arr(ref('Target'),1,30),'mode':enum('written','listening','mixed'),'maxItems':{'type':'integer','minimum':1,'maximum':30}}),
obj({'type':{'const':'table'},'language':enum('uk','es-ES'),'columns':arr(st(80),1,6),'rows':arr(arr(st(500),1,6),1,20)})]}
D['Source']=obj({'url':{'type':'string','format':'uri','pattern':'^https://','maxLength':2048},'passage':st(1500),'checkedAt':ref('Time'),'finding':st(1000)})
D['Verdict']=obj({'target':ref('Target'),'correctness':enum('correct','incorrect','unresolved','invalid-item'),'independence':enum('independent','supported','unknown','not-assessed'),'explanationKey':st(150),'matchedVariantId':st(150,0)},['target','correctness','independence','explanationKey'])
D['ReviewReport']=obj({'provider':enum('openai','anthropic','google','local','other'),'model':st(150),'effort':st(40),'reviewedAt':ref('Time'),'artifactHash':ref('Hash'),'authorProvider':enum('openai','anthropic','google','local','other'),'verdicts':arr(ref('Verdict'),1,30),'sources':arr(ref('Source'),1,30),'uncertainties':arr(st(1500),0,30),'findings':arr(st(1500),0,50)})
D['Scope']=enum('context:read','course:read','draft:write','help:write','practice:write','preference:write')
D['Health']=obj({'status':enum('ok','degraded','maintenance'),'instanceId':ref('Id'),'apiVersion':{'const':'1'},'storageWritable':B})
D['Capabilities']=obj({'apiVersion':{'const':'1'},'schemaVersion':{'const':1},'instanceId':ref('Id'),'profileEpoch':I,'packHash':ref('Hash'),'scopes':arr(ref('Scope'),0,6),'commandKinds':arr(st(60),0,30),'revision':I})
D['ContextMeta']=obj({'id':ref('Id'),'revision':I,'open':B,'lastActivityAt':ref('Time'),'title':st(160),'taskRevisionId':ref('Id'),'mode':enum('learn','practice','review','listening')})
D['Draft']=obj({'id':ref('Id'),'revision':I,'taskRevisionId':ref('Id'),'text':st(8000,0),'cursor':{'type':'integer','minimum':0,'maximum':8000},'savedAt':ref('Time')})
D['TaskView']=obj({'id':ref('Id'),'logicalId':st(150),'revision':I,'prompt':arr(ref('Block'),1,12),'targets':arr(ref('Target'),1,30),'mode':enum('choice','exact-variants','finite-slots','rubric-review'),'options':arr(obj({'id':st(100),'label':st(1000)}),0,12),'audioHashes':arr(ref('Hash'),0,4)})
D['Support']=obj({'id':ref('Id'),'revision':I,'contextId':ref('Id'),'targets':arr(ref('Target'),1,30),'kind':enum('rule','targeted-clue','translation','transcript','reveal','external-help'),'blocks':arr(ref('Block'),1,12),'contentHash':ref('Hash'),'delivery':enum('prepared','delivered','confirmed-undelivered','delivery-unknown'),'expiresAt':ref('Time')})
D['LearningSession']=obj({'id':ref('Id'),'revision':I,'mode':enum('learn','practice','review','listening'),'taskRevisionIds':arr(ref('Id'),0,100),'status':enum('active','finished'),'summaryId':ref('Id')},['id','revision','mode','taskRevisionIds','status'])
D['LessonProgress']=obj({'id':ref('Id'),'revision':I,'lessonId':st(100),'visitedStepIds':arr(st(100),0,100),'status':enum('visited','completed')})
D['Context']=obj({'metadata':ref('ContextMeta'),'task':ref('TaskView'),'draft':ref('Draft'),'supportState':enum('none','prepared','delivered','unknown'),'resultIds':arr(ref('Id'),0,100),'snapshotAt':ref('Time'),'snapshotToken':ref('Snapshot')})
D['Content']=obj({'id':ref('Id'),'logicalId':st(150),'revision':I,'resourceType':enum('lesson','material','phrase'),'state':enum('draft','needs-review','ready','retired','quarantined'),'title':st(160),'topicId':st(100),'blocks':arr(ref('Block'),0,40),'audioHashes':arr(ref('Hash'),0,20),'parentRevisionId':ref('Id')},['id','logicalId','revision','resourceType','state','title','topicId','blocks','audioHashes'])
D['Collection']=obj({'id':ref('Id'),'revision':I,'name':st(120),'origin':enum('course','personal'),'phraseIds':arr(ref('Id'),0,500)})
D['PracticeSet']=obj({'id':ref('Id'),'revision':I,'targets':arr(ref('Target'),1,30),'taskRevisionIds':arr(ref('Id'),1,30),'mode':enum('written','listening','mixed'),'route':{'type':'string','pattern':'^/[a-z0-9/._-]+$','maxLength':240}})
D['Attempt']=obj({'id':ref('Id'),'revision':I,'taskRevisionId':ref('Id'),'originalAnswer':st(8000,0),'submittedAt':ref('Time'),'status':enum('checked','unresolved'),'verdicts':arr(ref('Verdict'),1,30),'supportIds':arr(ref('Id'),0,100),'adjudicationIds':arr(ref('Id'),0,100)})
D['Review']=obj({'id':ref('Id'),'revision':I,'attemptId':ref('Id'),'state':enum('draft','needs-review','validated','rejected'),'report':ref('ReviewReport')})
D['Preference']=obj({'id':ref('Id'),'revision':I,'targets':arr(ref('Target'),1,30),'frequency':enum('usual','repeat-more','known'),'paused':B,'dueDate':ref('Date')})
D['Summary']=obj({'id':ref('Id'),'revision':I,'visitedLessons':I,'completedLessons':I,'independentTargets':I,'supportedTargets':I,'unresolvedTargets':I,'recommendedTargetIds':arr(ref('Target'),0,30)})
D['TimezonePreview']=obj({'id':ref('Id'),'revision':I,'profileEpoch':I,'profileRevision':I,'fromZone':st(80),'toZone':st(80),'retainedDueDates':{'const':True},'expiresAt':ref('Time')})
D['OwnerProfile']=obj({'id':ref('Id'),'revision':I,'profileEpoch':I,'reviewTimezone':st(80),'audioSpeed':{'enum':[1,0.85]},'theme':enum('system','light','dark'),'lastRestoreOperationId':ref('Id')},['id','revision','profileEpoch','reviewTimezone','audioSpeed','theme'])
D['TokenMetadata']=obj({'id':ref('Id'),'label':st(80),'scopes':arr(ref('Scope'),1,6),'createdAt':ref('Time'),'expiresAt':ref('Time'),'revoked':B})
D['TokenList']=obj({'items':arr(ref('TokenMetadata'),0,100),'profileRevision':I})
D['ExecutionReceipt']=obj({'id':ref('Id'),'keyId':ref('Id'),'jobId':ref('Id'),'provider':st(80),'model':st(150),'effort':st(40),'artifactHash':ref('Hash'),'reportHash':ref('Hash'),'completedAt':ref('Time'),'verifierVersion':st(80),'signature':ref('Hash')})
D['Resource']={'oneOf':[ref(n) for n in ['Content','TaskView','Collection','PracticeSet','Attempt','Review','Preference','Summary','Support','LearningSession','LessonProgress','TimezonePreview']]}
D['CatalogEntry']=obj({'id':st(150),'titleUk':st(160),'termEs':st(160),'blockId':{'type':'string','pattern':'^A[12]-[0-9]{2}$'},'situationIds':arr(st(100),0,20),'targets':arr(ref('Target'),0,100),'state':enum('draft','needs-review','ready','retired','quarantined')})
D['CatalogPage']=obj({'items':arr(ref('CatalogEntry'),0,100),'nextCursor':st(512,0),'revision':I})
D['Receipt']=obj({'apiVersion':{'const':'1'},'requestId':ref('Id'),'operationId':ref('Id'),'profileEpoch':I,'kind':st(60),'eventSeq':I,'entities':arr(ref('Ref'),0,30),'outcome':enum('created','updated','unchanged','checked','unresolved','prepared','delivered','cancelled','needs-review','ready'),'route':{'type':'string','pattern':'^(/[a-z0-9/._-]*)?$','maxLength':240},'contentHash':ref('Hash')},['apiVersion','requestId','operationId','profileEpoch','kind','eventSeq','entities','outcome'])
D['Error']=obj({'apiVersion':{'const':'1'},'requestId':ref('Id'),'code':{'type':'string','pattern':'^[A-Z][A-Z0-9_]{1,79}$'},'messageKey':st(160),'retryable':B,'currentRevision':I,'createdEntityId':ref('Id')},['apiVersion','requestId','code','messageKey','retryable'])
P={
'session.start':obj({'source':enum('lesson','practice-set','recommended'),'sourceId':ref('Id'),'targets':arr(ref('Target'),0,100),'mode':enum('learn','practice','review','listening'),'minutes':{'enum':[5,10,20]},'maxItems':{'type':'integer','minimum':1,'maximum':30}},['source','targets','mode','minutes','maxItems']),
'session.finish':obj({}),
'lesson.progress':obj({'sessionId':ref('Id'),'stepId':st(100),'action':enum('visit','finish')}),
'context.open':obj({'sessionId':ref('Id'),'taskRevisionId':ref('Id')}),
'context.activity':obj({'activity':enum('typing','navigation','submission'),'draftRevision':I}),
'context.close':obj({}),
'draft.save':obj({'text':st(8000,0),'cursor':{'type':'integer','minimum':0,'maximum':8000},'taskRevisionId':ref('Id')}),
'attempt.submit':obj({'draftId':ref('Id'),'draftRevision':I,'taskRevisionId':ref('Id'),'response':{'oneOf':[obj({'text':st(8000,0)}),obj({'optionId':st(100)})]}}),
'support.observe':obj({'kind':enum('interface-help','replay','speed-change','learner-reported-help'),'targets':arr(ref('Target'),0,30),'detailKey':st(150)}),
'support.prepare':obj({'targets':arr(ref('Target'),1,30),'kind':enum('rule','targeted-clue','translation','transcript','reveal','external-help'),'blocks':arr(ref('Block'),1,12),'taskRevisionId':ref('Id'),'deliveryRoute':enum('external','app')}),
'support.confirm':obj({'contentHash':ref('Hash'),'deliveryId':ref('Id'),'reportedDeliveredAt':ref('Time'),'phase':enum('before-submit','after-submit','unknown'),'targets':arr(ref('Target'),1,30)}),
'support.cancel':obj({'delivery':enum('confirmed-undelivered','delivery-unknown'),'reason':st(500)}),
'practice.create':obj({'targets':arr(ref('Target'),1,30),'mode':enum('written','listening','mixed'),'maxItems':{'type':'integer','minimum':1,'maximum':30},'phraseIds':arr(ref('Id'),0,100)}),
'phrase.capture':{'oneOf':[obj({'source':{'const':'course'},'sourceRevisionId':ref('Id')}),obj({'source':enum('spanish','uk-intent'),'text':st(2000),'meaning':st(2000,0)})]},
'material.draft':obj({'title':st(160),'topicId':st(100),'blocks':arr(ref('Block'),1,40),'parentRevisionId':ref('Id')},['title','topicId','blocks']),
'collection.create':obj({'name':st(120),'phraseIds':arr(ref('Id'),0,500)}),
'collection.patch':obj({'add':arr(ref('Id'),0,500),'remove':arr(ref('Id'),0,500),'name':st(120)},['add','remove']),
'preference.set':obj({'targets':arr(ref('Target'),1,30),'frequency':enum('usual','repeat-more','known'),'paused':B},['targets']),
'review.submit':obj({'attemptId':ref('Id'),'taskRevisionId':ref('Id'),'answerHash':ref('Hash'),'report':ref('ReviewReport')}),
'review.validate':obj({'executionReceiptIds':arr(ref('Id'),1,10),'reportId':ref('Id'),'evidenceHash':ref('Hash'),'corroboratingReportId':ref('Id'),'verifiedSources':arr(ref('Source'),0,30)},['executionReceiptIds','reportId','evidenceHash','verifiedSources']),
'content.promote':obj({'expectedHash':ref('Hash'),'reviewReceiptIds':arr(ref('Id'),1,10),'audioReceiptIds':arr(ref('Id'),0,100),'rightsReceiptId':ref('Id'),'coverageReceiptId':ref('Id')}),
'profile.timezone-preview':obj({'reviewTimezone':st(80)}),
'profile.settings':obj({'reviewTimezone':st(80),'timezonePreviewId':ref('Id'),'audioSpeed':{'enum':[1,0.85]},'theme':enum('system','light','dark')},[])
}
cmds=[]
for k,p in P.items():
    name='Payload_'+k.replace('.','_');D[name]=p
    props={'operationId':ref('Id'),'profileEpoch':I,'kind':{'const':k},'subjectId':ref('Id'),'expectedRevision':I,'payload':ref(name),'contextId':ref('Id'),'contextRevision':I,'contextSnapshot':ref('Snapshot')}
    req=['operationId','profileEpoch','kind','subjectId','expectedRevision','payload']
    if k.startswith('support.') or k in ['draft.save','attempt.submit','context.activity','context.close']:req+=['contextId','contextRevision']
    if k in ['support.prepare','support.observe','draft.save','attempt.submit','context.activity']:req+=['contextSnapshot']
    c=obj(props,req);cmds.append(c)
D['Command']={'oneOf':cmds}
D['Exchange']=obj({'nonce':{'type':'string','pattern':'^[A-Za-z0-9_-]{43}$'}})
D['Session']=obj({'csrfToken':st(100),'profileEpoch':I,'profileId':ref('Id'),'profileRevision':I,'revision':I,'expiresAt':ref('Time')})
D['OwnerWrite']=obj({'operationId':ref('Id'),'profileEpoch':I,'expectedRevision':I})
D['TokenCreate']=obj({'operationId':ref('Id'),'profileEpoch':I,'expectedRevision':I,'label':st(80),'scopes':arr(ref('Scope'),1,6),'ttlDays':{'type':'integer','minimum':1,'maximum':30}})
D['TokenCreated']=obj({'id':ref('Id'),'token':{'type':'string','pattern':'^[A-Za-z0-9_-]{43}$'},'expiresAt':ref('Time'),'scopes':arr(ref('Scope'),1,6)})
D['ExportRequest']=obj({'operationId':ref('Id'),'profileEpoch':I,'expectedRevision':I,'selfContained':B})
D['Artifact']=obj({'id':ref('Id'),'sha256':ref('Hash'),'sizeBytes':I,'downloadRoute':{'type':'string','pattern':'^/api/v1/recovery/downloads/[a-f0-9-]+$'},'expiresAt':ref('Time')})
D['RestorePreviewRequest']=obj({'operationId':ref('Id'),'profileEpoch':I,'expectedRevision':I,'uploadId':ref('Id')})
D['RestorePreview']=obj({'id':ref('Id'),'archiveHash':ref('Hash'),'liveEventSeq':I,'profileEpoch':I,'profileId':ref('Id'),'attemptCount':I,'draftCount':I,'schemaVersion':I,'missingAssets':arr(ref('Hash'),0,10000),'unverifiedHistoricalReceiptCount':I,'requiresSourceTrust':B,'confirmation':st(100),'expiresAt':ref('Time')})
D['RestoreConfirm']=obj({'operationId':ref('Id'),'profileEpoch':I,'expectedRevision':I,'previewId':ref('Id'),'archiveHash':ref('Hash'),'trustImportedProvenance':B,'confirmation':st(100)})
S={'$schema':'https://json-schema.org/draft/2020-12/schema','$id':'https://spanish-learning-lab.invalid/contracts/v1/schemas.json','title':'Spanish Learning Lab planned API v1','$defs':D}
(out/'schemas.json').write_text(json.dumps(S,indent=2,ensure_ascii=False)+'\n')
def ext(n):return {'$ref':'./schemas.json#/$defs/'+n}
def response(n):return {'description':'Validated response','content':{'application/json':{'schema':ext(n)}}}
def envelope(n):return obj({'apiVersion':{'const':'1'},'requestId':ext('Id'),'profileEpoch':I,'data':ext(n)})
def op(method,n,request=None,public=False,params=None,binary=False,enveloped=True):
    x={'operationId':n,'security':[] if public else [{'agentBearer':[]},{'ownerCookie':[]}], 'responses':{'200':response(n) if n in D and not enveloped else {'description':'Success','content':{'application/json':{'schema':envelope(n)}}},'400':response('Error'),'401':response('Error'),'403':response('Error'),'409':response('Error'),'413':response('Error'),'422':response('Error'),'429':response('Error'),'503':response('Error')}}
    if params:x['parameters']=params
    if request:x['requestBody']={'required':True,'content':{'application/json':{'schema':ext(request)}}}
    if binary:x['requestBody']={'required':True,'content':{'application/zip':{'schema':{'type':'string','format':'binary'}}}}
    return x
paths={}
def add(path,method,n,**kw):paths.setdefault(path,{})[method]=op(method,n,**kw)
def param(n,where,sch):return {'name':n,'in':where,'required':where=='path','schema':sch}
add('/health','get','Health',public=True,enveloped=False)
add('/capabilities','get','Capabilities',enveloped=False)
D['ContextList']=obj({'items':arr(ref('ContextMeta'),0,20)})
add('/contexts','get','ContextList')
add('/contexts/{id}','get','Context',params=[param('id','path',ext('Id'))])
add('/catalog','get','CatalogPage',params=[param('query','query',st(100,0)),param('block','query',{'type':'string','pattern':'^A[12]-[0-9]{2}$'}),param('situation','query',st(100)),param('mode','query',enum('written','listening','mixed')),param('cursor','query',st(512)),param('limit','query',{'type':'integer','minimum':1,'maximum':100})])
add('/resources/{resourceType}/{id}','get','Resource',params=[param('resourceType','path',enum('lesson','task','phrase','material','collection','practice-set','attempt','review','preference','summary','support','session','lesson-progress','timezone-preview')),param('id','path',ext('Id'))])
add('/operations/{operationId}','get','Receipt',params=[param('operationId','path',ext('Id'))],enveloped=False)
add('/commands','post','Receipt',request='Command',enveloped=False)
add('/auth/exchange','post','Session',request='Exchange',public=True)
add('/auth/session','get','Session')
add('/auth/logout','post','Receipt',request='OwnerWrite',enveloped=False)
add('/profile','get','OwnerProfile')
add('/auth/tokens','get','TokenList')
add('/auth/tokens','post','TokenCreated',request='TokenCreate')
add('/auth/tokens/{id}','delete','Receipt',request='OwnerWrite',params=[param('id','path',ext('Id'))],enveloped=False)
add('/recovery/export','post','Artifact',request='ExportRequest')
add('/recovery/uploads','post','Artifact',binary=True)
add('/recovery/restore-preview','post','RestorePreview',request='RestorePreviewRequest')
add('/recovery/restore-confirm','post','Receipt',request='RestoreConfirm',enveloped=False)
for path,mime in [('/media/{sha256}','audio/mpeg'),('/recovery/downloads/{id}','application/zip')]:
    pn='sha256' if 'sha256' in path else 'id'
    paths[path]={'get':{'operationId':'getMedia' if pn=='sha256' else 'downloadRecovery','security':[{'ownerCookie':[]}],'parameters':[param(pn,'path',ext('Hash' if pn=='sha256' else 'Id'))],'responses':{'200':{'description':'Authenticated local bytes','content':{mime:{'schema':{'type':'string','format':'binary'}}}},'206':{'description':'Validated bounded byte range'},'401':response('Error'),'403':response('Error'),'404':response('Error'),'416':response('Error')}}}
for path,methods in paths.items():
    for method,x in methods.items():
        x['operationId']=method+'_'+re.sub(r'[^A-Za-z0-9]+','_',path).strip('_')
        if path=='/profile' or path.startswith('/auth/') or path.startswith('/recovery/'):x['security']=[] if path=='/auth/exchange' else [{'ownerCookie':[]}]
        if method in ['post','delete'] and path!='/auth/exchange':
            x.setdefault('parameters',[]).extend([{'name':'Idempotency-Key','in':'header','required':True,'schema':ext('Id')},{'name':'X-Profile-Epoch','in':'header','required':True,'schema':I},{'name':'If-Match','in':'header','required':True,'schema':{'type':'string','pattern':'^"[0-9]+"$'}},{'name':'X-CSRF-Token','in':'header','required':False,'description':'Required for owner cookie authentication; forbidden as a substitute for bearer authorization.','schema':st(100)}])
O={'openapi':'3.1.0','info':{'title':'Spanish Learning Lab local API — planned','version':'1.0.0','description':'No service implemented. Server URL discovered privately; placeholder port is not reserved. API.md supplies authorization/domain semantics.'},'servers':[{'url':'http://spanish-learning-lab.localhost:{port}/api/v1','variables':{'port':{'default':'0'}}}],'paths':paths,'components':{'securitySchemes':{'agentBearer':{'type':'http','scheme':'bearer'},'ownerCookie':{'type':'apiKey','in':'cookie','name':'sll_session'}}}}
(out/'openapi.json').write_text(json.dumps(O,indent=2)+'\n')
# Write once more after adding ContextList referenced by OpenAPI.
(out/'schemas.json').write_text(json.dumps(S,indent=2,ensure_ascii=False)+'\n')
u=lambda n:f'00000000-0000-4000-8000-{n:012d}'
base={'operationId':u(1),'profileEpoch':1,'subjectId':u(2),'expectedRevision':0}
valid=[{'schema':'Command','value':{**base,'kind':'phrase.capture','payload':{'source':'uk-intent','text':'Синтетичний намір для тесту','meaning':''}}}, {'schema':'Command','value':{**base,'kind':'support.prepare','contextId':u(3),'contextRevision':4,'contextSnapshot':'s'*43,'payload':{'targets':[{'skillId':'participle.hecho','modality':'written-form'}],'kind':'targeted-clue','blocks':[{'type':'paragraph','language':'uk','text':'Синтетична підказка, не навчальний матеріал.'}],'taskRevisionId':u(4),'deliveryRoute':'app'}}}, {'schema':'Receipt','value':{'apiVersion':'1','requestId':u(5),'operationId':u(1),'profileEpoch':1,'kind':'phrase.capture','eventSeq':2,'entities':[{'id':u(2),'revision':1,'resourceType':'phrase'}],'outcome':'created'}}, {'schema':'Error','value':{'apiVersion':'1','requestId':u(5),'code':'STALE_REVISION','messageKey':'error.staleRevision','retryable':False,'currentRevision':2}}]
invalid=[{'schema':'Command','value':{**valid[0]['value'],'payload':{'source':'uk-intent','text':'x','meaning':'','ready':True}}},{'schema':'Command','value':{**base,'kind':'raw.sql','payload':{}}},{'schema':'Command','value':{**base,'kind':'support.prepare','payload':valid[1]['value']['payload']}},{'schema':'Block','value':{'type':'html','language':'uk','text':'<script>bad</script>'}},{'schema':'Target','value':{'skillId':'x','modality':'speaking'}},{'schema':'Command','value':{**base,'kind':'practice.create','payload':{'targets':[],'mode':'mixed','maxItems':31,'phraseIds':[]}}}]
# Exercise every command variant with a synthetic shape; domain/permission validity is not claimed.
extra={
'session.start':{'source':'recommended','targets':[],'mode':'review','minutes':10,'maxItems':10},
'session.finish':{},'lesson.progress':{'sessionId':u(7),'stepId':'step-1','action':'visit'},
'context.open':{'sessionId':u(7),'taskRevisionId':u(4)},'context.activity':{'activity':'typing','draftRevision':1},'context.close':{},
'draft.save':{'text':'synthetic','cursor':9,'taskRevisionId':u(4)},
'attempt.submit':{'draftId':u(8),'draftRevision':1,'taskRevisionId':u(4),'response':{'text':'synthetic'}},
'support.observe':{'kind':'replay','targets':[],'detailKey':'audio.replay'},
'support.confirm':{'contentHash':'a'*64,'deliveryId':u(9),'reportedDeliveredAt':'2026-10-01T08:00:00Z','phase':'before-submit','targets':[{'skillId':'participle.hecho','modality':'written-form'}]},
'support.cancel':{'delivery':'confirmed-undelivered','reason':'Synthetic no-delivery fixture'},
'practice.create':{'targets':[{'skillId':'participle.hecho','modality':'written-form'}],'mode':'written','maxItems':10,'phraseIds':[]},
'material.draft':{'title':'Synthetic','topicId':'A2-03','blocks':[{'type':'practice-link','labelUk':'Синтетичне посилання','targets':[{'skillId':'participle.hecho','modality':'written-form'}],'mode':'written','maxItems':10}]},
'collection.create':{'name':'Synthetic','phraseIds':[]},'collection.patch':{'add':[],'remove':[],'name':'Synthetic renamed'},
'preference.set':{'targets':[{'skillId':'participle.hecho','modality':'written-form'}],'paused':True},
'profile.timezone-preview':{'reviewTimezone':'Europe/Madrid'},'profile.settings':{'theme':'system'},
'content.promote':{'expectedHash':'a'*64,'reviewReceiptIds':[u(10)],'audioReceiptIds':[],'rightsReceiptId':u(11),'coverageReceiptId':u(12)},
'review.validate':{'executionReceiptIds':[u(13)],'reportId':u(14),'evidenceHash':'b'*64,'verifiedSources':[]},
}
report={'provider':'openai','model':'synthetic-test-model','effort':'high','reviewedAt':'2026-10-01T08:00:00Z','artifactHash':'a'*64,'authorProvider':'anthropic','verdicts':[{'target':{'skillId':'participle.hecho','modality':'written-form'},'correctness':'unresolved','independence':'unknown','explanationKey':'synthetic.uncertain'}],'sources':[{'url':'https://example.invalid/source','passage':'Synthetic passage, not a real verification','checkedAt':'2026-10-01T08:00:00Z','finding':'Synthetic fixture only'}],'uncertainties':['Not actual language evidence'],'findings':[]}
extra['review.submit']={'attemptId':u(15),'taskRevisionId':u(4),'answerHash':'a'*64,'report':report}
for n,(kind,payload) in enumerate(extra.items(),20):
    value={**base,'operationId':u(n),'kind':kind,'payload':payload}
    if kind.startswith('support.') or kind in ['draft.save','attempt.submit','context.activity','context.close']:value.update(contextId=u(3),contextRevision=4)
    if kind in ['support.prepare','support.observe','draft.save','attempt.submit','context.activity']:value['contextSnapshot']='s'*43
    valid.append({'schema':'Command','value':value})
valid.append({'schema':'TokenList','value':{'items':[{'id':u(50),'label':'Synthetic agent','scopes':['context:read'],'createdAt':'2026-10-01T08:00:00Z','expiresAt':'2026-10-08T08:00:00Z','revoked':False}],'profileRevision':2}})
invalid.append({'schema':'TokenList','value':{'items':[{**valid[-1]['value']['items'][0],'token':'should-not-be-listed'}],'profileRevision':2}})
invalid.append({'schema':'Command','value':{**valid[1]['value'],'contextSnapshot':'expired-looking-client-string'}})
(out/'examples.json').write_text(json.dumps({'notice':'Synthetic wire examples; not linguistically reviewed course content.','valid':valid,'invalid':invalid},indent=2,ensure_ascii=False)+'\n')
text=(repo/'docs/CURRICULUM-A1-A2.md').read_text()
rows=[]
for n,line in enumerate(text.splitlines(),1):
    m=re.match(r'^\| (A[12]-\d\d-([OLC])\d+)\s*\|',line)
    if m:
        cells=[c.strip() for c in line.strip('|').split('|')]
        rows.append({'id':m[1],'kind':{'O':'objective','L':'lesson','C':'optional-check'}[m[2]],'blockId':m[1].rsplit('-',1)[0],'sourceLine':n,'description':cells[1],'sourceCells':cells[2:],'productionState':'not-authored'})
ledger={'schemaVersion':1,'source':'docs/CURRICULUM-A1-A2.md','sourceSha256':hashlib.sha256(text.encode()).hexdigest(),'notice':'Source index only. WP-04 expands these broad rows into reviewed atomic inventory, not a completed content bank.','counts':{k:sum(r['kind']==k for r in rows) for k in ['objective','lesson','optional-check']},'supportingAllocations':[f'CV-{i:02}' for i in range(1,7)],'rows':rows}
(out/'curriculum-ledger.json').write_text(json.dumps(ledger,indent=2,ensure_ascii=False)+'\n')
print('Wrote',len(D),'definitions,',len(P),'command kinds,',len(paths),'paths,',ledger['counts'])
