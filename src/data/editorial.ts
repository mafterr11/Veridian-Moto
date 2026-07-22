export type DemoArticle = {
  slug: string;
  category: string;
  categorySlug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  publishedAt: string;
  featured: boolean;
  bodyMarkdown: string;
  seoTitle?: string;
  seoDescription?: string;
};

export const articles: readonly DemoArticle[] = [
  {
    slug: "alegerea-motocicletei-adventure",
    category: "Ghiduri",
    categorySlug: "ghiduri",
    title: "Adventure sau touring: cum alegi fără să cumperi doar cu ochii",
    excerpt:
      "Poziție, greutate, roți și tipul de drum. Patru criterii mai utile decât dimensiunea parbrizului.",
    image: "/images/models/terran-650.webp",
    imageAlt: "VERIDIAN Terran 650 pe un drum montan",
    publishedAt: "2026-07-12T08:00:00.000Z",
    featured: true,
    bodyMarkdown: `## Începe cu drumurile reale

Cea mai bună motocicletă nu este cea care promite cele mai multe destinații, ci cea care se potrivește drumurilor pe care le faci cu adevărat. Înainte să compari parbrize, moduri de rulare sau diametrul roții față, notează cum arată o lună normală: câți kilometri faci prin oraș, cât mergi pe autostradă, cât de des ieși pe drumuri naționale și dacă macadamul este o destinație sau doar o fotografie salvată.

Adventure și touring nu mai sunt două cutii perfect separate. Un adventure modern poate traversa țara confortabil, iar un sport-tourer bine echilibrat poate trece fără emoții peste un drum forestier îngrijit. Diferența apare în felul în care fiecare motocicletă își distribuie compromisurile.

## Greutatea pe care o simți, nu cea din tabel

Două motociclete cu aceeași masă declarată pot părea complet diferite la ieșirea din parcare. Înălțimea centrului de greutate, lățimea șeii și raza de bracaj contează mai mult decât câteva kilograme în fișa tehnică. Un adventure înalt oferă vizibilitate și cursă lungă a suspensiei, dar îți cere mai multă atenție la întoarceri și cu pasager.

Un touring ține de obicei masa mai jos și se așază natural pe asfalt. La viteză de croazieră pare ușor, însă trebuie testat cu rezervorul plin și, ideal, cu bagaje. Ceea ce este invizibil la 90 km/h devine foarte concret când împingi motocicleta în rampă.

> Motocicleta potrivită nu este cea mai capabilă în scenariul imaginar, ci cea care îți cere cele mai puține compromisuri în fiecare weekend.

## Ergonomia se măsoară după două ore

Poziția verticală nu garantează confort. Contează unghiul genunchilor, distanța până la ghidon, sprijinul șeii și presiunea aerului pe cască. Un parbriz foarte înalt poate crea turbulențe exact la nivelul vizierei, în timp ce unul mai scurt lasă aer curat și previzibil.

Verifică aceste patru puncte în ordine:

- Poți sprijini ferm cel puțin un picior când motocicleta este încărcată
- Genunchii rămân relaxați, fără să împingă în rezervor
- Încheieturile nu susțin greutatea trunchiului la viteza obișnuită
- Parbrizul nu produce zgomot sau vibrații în jurul căștii

### Roata față schimbă caracterul

O roată față de 19 sau 21 de inch trece mai calm peste denivelări și oferă mai multă încredere pe suprafețe slabe. În schimb, răspunsul la schimbările rapide de direcție este mai lent decât la o roată de 17 inch cu anvelopă sport-touring. Nu există o alegere universal mai bună: există doar terenul pe care vrei să-l prioritizezi.

## Echiparea utilă bate lista lungă

La drum lung, cruise controlul, mânerele încălzite și reglajul simplu al suspensiei pot conta mai mult decât încă zece cai putere. Pentru ieșiri pe drumuri rele, protecția motorului, jantele potrivite și posibilitatea de a dezactiva controlat anumite intervenții electronice sunt investiții mai logice decât un top case uriaș.

Privește și costul motocicletei gata de plecare. Dacă un model mai ieftin are nevoie imediat de parbriz, protecții, suporturi și bagaje, avantajul de preț se poate evapora înainte de primul concediu.

## Testul care spune adevărul

Un test ride util nu trebuie să fie spectaculos. Include o plecare din rampă, întoarceri strânse, o porțiune denivelată, frânare progresivă și cel puțin zece minute la viteza ta de croazieră. Reglează parbrizul și manetele înainte să pornești; altfel testezi setările altcuiva, nu motocicleta.

La final, nu întreba doar dacă a fost rapidă. Întreabă-te dacă ai înțeles comenzile fără efort, dacă ai putea ridica motocicleta de pe cric după o zi lungă și dacă ai mai vrea încă o sută de kilometri. Fotografia atrage atenția. Ergonomia și felul în care motocicleta îți dă încredere decid ce rămâne în garaj.`,
    seoTitle: "Adventure sau touring? Ghid practic de alegere",
    seoDescription:
      "Compară ergonomia, greutatea, roțile și echiparea înainte să alegi o motocicletă adventure sau touring.",
  },
  {
    slug: "abs-in-viraj",
    category: "Tehnologie",
    categorySlug: "tehnologie",
    title: "Ce face, de fapt, ABS-ul în viraj",
    excerpt:
      "De la senzori la intervenție: explicăm sistemul fără jargon de broșură.",
    image: "/images/models/apex-675-r.webp",
    imageAlt: "VERIDIAN Apex 675 R în viraj",
    publishedAt: "2026-07-04T08:00:00.000Z",
    featured: false,
    bodyMarkdown: `## Mai mult context pentru aceeași frână

ABS-ul convențional compară viteza roților și reduce presiunea atunci când detectează că una este pe punctul de a se bloca. Varianta sensibilă la înclinare adaugă o piesă importantă: unitatea inerțială, numită adesea IMU. Aceasta urmărește mișcările motocicletei pe mai multe axe și oferă sistemului o imagine despre cât de înclinată, ridicată sau instabilă este motocicleta.

Scopul nu este să creeze aderență, ci să folosească mai atent aderența disponibilă. Când motocicleta este înclinată, o parte din capacitatea anvelopei este deja folosită pentru schimbarea direcției. Sistemul adaptează creșterea presiunii de frânare astfel încât cererea longitudinală să nu vină brutal peste sarcina laterală.

## Ce se întâmplă într-o fracțiune de secundă

Senzorii citesc viteza roților de multe ori pe secundă. IMU adaugă unghiul și ritmul mișcării, iar modulul hidraulic poate menține, reduce sau reaplica presiunea. Pentru pilot, tot procesul poate fi aproape invizibil pe asfalt bun. Pe o suprafață rece ori murdară, maneta poate pulsa ușor și motocicleta poate tinde să-și lărgească linia.

Sistemul lucrează cel mai bine atunci când comenzile sunt clare. O apăsare progresivă îi permite suspensiei să transfere sarcina spre roata față și anvelopei să construiască aderență înainte de presiunea maximă.

> ABS-ul în viraj este o plasă de siguranță foarte inteligentă, nu o derogare de la fizică.

## Ce poate și ce nu poate face

- Poate reduce riscul blocării unei roți într-o frânare neașteptată
- Poate adapta presiunea la înclinarea și dinamica motocicletei
- Poate păstra o rezervă de direcție pe suprafețe cu aderență rezonabilă
- Nu poate compensa o viteză mult prea mare pentru raza virajului
- Nu poate crea aderență pe ulei, gheață sau pietriș liber
- Nu garantează păstrarea perfectă a trasesului inițial

Ultimul punct contează. Chiar dacă roțile continuă să ruleze, frânarea înclinată poate ridica motocicleta și poate deschide traiectoria. Privirea trebuie să rămână spre ieșire, iar brațele relaxate. Dacă pilotul fixează obstacolul, tehnologia nu poate corecta automat alegerea direcției.

## Frâna față rămâne instrumentul principal

Teama de a atinge frâna față în viraj este de înțeles, dar prea simplistă. Antrenamentul corect construiește presiunea lin, cu două degete, și reduce treptat frânarea pe măsură ce înclinarea crește. Tehnica este cunoscută drept trail braking și trebuie învățată progresiv, într-un mediu controlat.

Frâna spate poate stabiliza motocicleta la viteză mică sau în anumite corecții, însă nu înlocuiește capacitatea de oprire a roții față. Repartizarea electronică, acolo unde există, coordonează cele două circuite fără să schimbe această realitate de bază.

### Cum testezi sistemul în siguranță

Nu încerca să provoci ABS-ul în trafic. Începe într-un curs sau într-un spațiu închis, pe motocicleta dreaptă, cu viteze mici și un instructor. Familiarizează-te mai întâi cu senzația intervenției, apoi cu frânarea progresivă și abia ulterior cu exercițiile care includ o ușoară schimbare de direcție.

Verifică și anvelopele: presiunea greșită, cauciucul îmbătrânit sau profilul nepotrivit pot reduce rezerva pe care sistemul încearcă să o gestioneze. Electronica modernă este remarcabilă, dar intră în ecuație după contactul mecanic dintre câțiva centimetri pătrați de cauciuc și asfalt.

## Ideea de reținut

ABS-ul în viraj face o situație dificilă mai gestionabilă. Valoarea lui apare exact în momentul pe care nu l-ai planificat: mașina care intră în bandă, pietrișul din apex sau curba care se strânge. Pilotajul bun evită criza; sistemul păstrează o marjă atunci când realitatea nu cooperează.`,
    seoTitle: "ABS în viraj: cum funcționează și care sunt limitele",
    seoDescription:
      "O explicație clară despre IMU, frânarea înclinată și limitele reale ale ABS-ului în viraj.",
  },
  {
    slug: "trei-pasuri-meridian",
    category: "Povești",
    categorySlug: "povesti",
    title: "O zi, trei pasuri montane și un Meridian 900 GT",
    excerpt:
      "Un traseu lung cât să conteze și scurt cât să-l repeți weekendul viitor.",
    image: "/images/models/meridian-900-gt.webp",
    imageAlt: "VERIDIAN Meridian 900 GT pregătit de călătorie",
    publishedAt: "2026-06-28T08:00:00.000Z",
    featured: false,
    bodyMarkdown: `## 05:40 — orașul încă doarme

Traseul avea puțin peste cinci sute de kilometri și trei treceri montane, suficient pentru o zi serioasă, dar nu atât de mult încât kilometrii să devină singurul subiect. În cutiile laterale au intrat un strat impermeabil, apă, o trusă compactă și aparatul foto. Nimic spectaculos; exact bagajul pe care îl iei când vrei să te miști, nu să te muți.

Meridian 900 GT a ieșit din oraș înainte de răsărit. Parbrizul a rămas în poziția joasă cât viteza era mică, iar încălzirea în manșoane a făcut cele zece grade mai puțin importante. Pe primul drum rapid, pilotul automat setat conservator a eliberat mâna dreaptă fără să rupă legătura cu ritmul.

## Primul pas — asfalt rece și lumină joasă

Urcarea a început pe asfalt uscat, dar rece, cu pete de umezeală sub copaci. Motorul de 900 cm³ nu cere turație pentru fiecare depășire; treapta a patra acoperă mare parte din drum, iar răspunsul rotund înseamnă că poți păstra o linie curată fără să negociezi constant cu schimbătorul.

Motocicleta nu ascunde cele 241 de kilograme, însă le ține organizate. La intrarea în viraj cere o comandă hotărâtă, apoi rămâne pe trasă fără corecții. Suspensia filtrează rosturile și denivelările scurte fără să transforme direcția într-o conversație vagă.

> O motocicletă de touring bună nu transformă drumul în canapea. Elimină oboseala inutilă și păstrează exact informația de care ai nevoie.

## Pauza care confirmă ergonomia

După două ore, primul popas spune mai mult decât orice fișă tehnică. Nu există presiune ascuțită în șezut, genunchii nu cer întindere imediată, iar gâtul nu a luptat cu turbulențele. Șaua încălzită pare un capriciu în showroom și un argument serios când norii țin soarele departe.

Pentru o zi lungă, câteva detalii fac diferența:

- Reglajul parbrizului se poate face rapid, fără oprire complicată
- Cruise controlul reduce tensiunea din umăr pe legăturile rapide
- TPMS-ul confirmă presiunea după schimbări mari de temperatură
- Cutia laterală dreaptă primește casca la pauza de prânz

## Al doilea pas — ritmul potrivit

La mijlocul zilei asfaltul s-a încălzit, iar virajele au devenit mai largi. Aici Meridian arată partea sportivă a ecuației. Quickshifterul nu este folosit pentru spectacol, ci pentru continuitate: urci o treaptă fără să miști motocicleta din echilibru și păstrezi frâna de motor la coborâre.

Frânele au o mușcătură inițială calmă și multă forță după primii milimetri. Este o calibrare bună pentru drum, mai ales cu pasager sau bagaje, pentru că evită transferurile bruște. În modul Road, accelerația rămâne precisă fără să fie nervoasă; modul Sport are sens doar când asfaltul și atenția sunt ambele la nivelul potrivit.

### O masă simplă, fără grabă

Pauza de prânz a durat patruzeci de minute. Traseul nu era o cursă, iar autonomia rezervorului elimina tentația opririlor calculate la limită. Uneori cea mai bună funcție touring este libertatea de a alege benzinăria cu cafea bună, nu prima care apare pe bord.

## Al treilea pas — ploaia schimbă conversația

Ultima trecere a venit cu o ploaie scurtă și asfalt lucios. Modul Rain a înmuiat răspunsul accelerației, iar controlul tracțiunii a rămas discret. Mai important, protecția la vânt a ținut partea principală a apei departe de trunchi, iar comenzile au rămas ușor de folosit cu mănuși ude.

Ritmul a scăzut fără frustrare. O motocicletă convingătoare nu te împinge să demonstrezi ceva când condițiile se schimbă. Îți oferă informații clare și lasă decizia la tine.

## Întoarcerea

Ultimii kilometri au fost din nou pe drum rapid, cu luminile orașului în față. După aproape unsprezece ore, nu lipsa durerii a fost concluzia principală, ci faptul că atenția rămăsese disponibilă. Mai puteam citi traficul, alege banda și manevra motocicleta fără sentimentul că ziua se terminase cu o oră prea târziu.

Meridian 900 GT nu micșorează distanțele. Le face mai bogate: suficient confort ca să ajungi departe și suficient caracter ca să-ți amintești fiecare pas. În garaj, înainte să se răcească motorul, traseul următor era deja deschis pe hartă.`,
    seoTitle: "Trei pasuri montane într-o zi cu Meridian 900 GT",
    seoDescription:
      "Jurnal de drum cu VERIDIAN Meridian 900 GT: peste 500 km, trei pasuri, ploaie și concluzii despre confort.",
  },
  {
    slug: "naveta-electrica",
    category: "Ghiduri",
    categorySlug: "ghiduri",
    title: "Când are sens o motocicletă electrică în oraș",
    excerpt:
      "Autonomie, încărcare și costuri, calculate pentru o săptămână normală.",
    image: "/images/models/volt-e2.webp",
    imageAlt: "VERIDIAN Volt E2 într-un decor urban",
    publishedAt: "2026-06-16T08:00:00.000Z",
    featured: false,
    bodyMarkdown: `## Autonomie suficientă, nu maximă

O motocicletă electrică devine convingătoare când autonomia promisă se transformă în autonomie suficientă, iar încărcarea intră firesc în program. Pentru navetă, întrebarea utilă nu este cât poate merge într-un test ideal, ci câți kilometri faci între două momente în care motocicleta oricum stă.

Începe cu o săptămână reală. Adună drumul până la birou, cumpărăturile, ocolurile și ieșirea de seară. Apoi adaugă o rezervă de cel puțin 25% pentru temperatură, vânt, trafic și schimbarea planului. Dacă rezultatul rămâne mult sub autonomia realistă, nu vei gestiona bateria în fiecare zi; pur și simplu vei merge.

## Un exemplu de navetă

Pentru un traseu de 22 km pe sens, cinci zile pe săptămână înseamnă 220 km, înainte de opririle suplimentare. Un Volt E2 cu autonomie declarată de 190 km nu are nevoie să parcurgă toată săptămâna dintr-o singură încărcare. Două sesiuni acasă sau una mai lungă la birou pot acoperi programul fără opriri dedicate.

Scenariul devine și mai bun dacă bateria stă în intervalul de utilizare recomandat, fără cicluri repetate de la 100% la aproape zero. Încărcarea oportunistă nu înseamnă să cauți permanent prize; înseamnă să folosești perioadele în care vehiculul este deja parcat.

> La electric, infrastructura potrivită nu este neapărat stația rapidă de pe hartă. Este priza sigură aflată acolo unde dormi sau lucrezi.

## Verifică locul înaintea motocicletei

Promisiunea unei prize devine utilă doar dacă instalația este verificată, circuitul suportă consumul și cablul poate fi folosit fără improvizații. La bloc, acordul pentru un punct dedicat și măsurarea separată pot conta mai mult decât diferența dintre două modele.

Lista minimă pentru o rutină fără surprize:

- Acces legal și constant la o priză sau stație compatibilă
- Circuit verificat de un electrician, cu protecțiile corecte
- Cablu care nu traversează spații comune sau zone de trecere
- Un plan alternativ pentru zilele în care punctul nu este disponibil
- Posibilitatea de a programa încărcarea în intervale convenabile

## Costul real pe săptămână

Consumul unei motociclete electrice se măsoară în kWh la 100 km. Înmulțește valoarea realistă cu tariful contractului tău, apoi include pierderile de încărcare. Diferența față de benzină poate fi importantă, dar nu este singurul calcul.

Reviziile au mai puține consumabile legate de motor: nu există ulei, filtru de ulei, bujii sau joc al supapelor. Rămân însă anvelopele, frânele, rulmenții, suspensia și transmisia secundară, dacă modelul folosește lanț. Costul bateriei este încorporat în prețul inițial și trebuie privit împreună cu garanția și condițiile ei.

### Iarna schimbă estimarea

Temperatura scăzută reduce temporar energia disponibilă, iar încălzirea echipamentului consumă din aceeași baterie. Viteza mare și vântul frontal pot conta chiar mai mult, deoarece rezistența aerului crește rapid. O rezervă generoasă în calcul este mai valoroasă decât o promisiune optimistă dintr-o zi perfectă.

## Ce câștigi în fiecare dimineață

Răspunsul instant, lipsa schimbătorului și controlul foarte fin la viteze mici schimbă traficul urban. Nu aștepți încălzirea motorului, nu cauți punctul de cuplu al ambreiajului și nu trimiți căldură spre picioare la semafor. Marșarierul asistat ajută când parcarea are o pantă pe care ai ignorat-o la sosire.

Liniștea mecanică nu înseamnă absența implicării. Accelerația precisă și cuplul disponibil imediat pot face fiecare ieșire din intersecție surprinzător de vie. Este o experiență diferită, nu o copie tăcută a motocicletei termice.

## Unde nu este încă alegerea simplă

Excursiile spontane foarte lungi, autostrada susținută și parcarea fără acces la încărcare pot transforma economia de energie într-o problemă de program. Rețeaua publică trebuie evaluată după amplasament, disponibilitate și tipul conectorului, nu doar după numărul de puncte din aplicație.

Dacă singura ta motocicletă trebuie să traverseze țara fără planificare, un model termic rămâne mai flexibil. Dacă majoritatea kilometrilor sunt urbani, ai o priză sigură și poți închiria ori împrumuta altceva pentru două vacanțe pe an, electricul poate fi alegerea mai rațională — și, surprinzător, mai distractivă.`,
    seoTitle: "Motocicleta electrică în oraș: autonomie și costuri",
    seoDescription:
      "Calculează autonomia, încărcarea și costul real al unei motociclete electrice pentru naveta urbană.",
  },
  {
    slug: "foundry-design",
    category: "Povești",
    categorySlug: "povesti",
    title: "Cum desenezi o clasică fără să rămâi în trecut",
    excerpt:
      "Proporții familiare, ergonomie actuală și detalii care nu imită istoria.",
    image: "/images/models/foundry-800.webp",
    imageAlt: "Detaliu de design VERIDIAN Foundry 800",
    publishedAt: "2026-06-02T08:00:00.000Z",
    featured: false,
    bodyMarkdown: `## O siluetă pe care o recunoști

Foundry 800 pornește de la trei gesturi simple: un rezervor compact, o șa aproape dreaptă și motorul lăsat vizibil. Proporțiile sunt familiare fără să indice un an sau un model anume. Roțile au suficientă prezență, spațiul dintre șa și roata spate rămâne curat, iar linia superioară nu este întreruptă de carene decorative.

În primele schițe, tentația este să adaugi semne evidente de epocă: aripi adânci, capace cromate, instrumente care imită cadrane mecanice. Fiecare poate arăta bine separat. Împreună, riscă să transforme motocicleta într-un costum.

## Proporția înaintea detaliului

Designul unei motociclete este citit de la distanță înainte să fie analizat de aproape. Relația dintre rezervor, motor și roți trebuie să funcționeze ca o singură formă. Abia apoi vin cusăturile, suprafețele frezate și textura vopselei.

La Foundry, rezervorul se îngustează în zona genunchilor pentru control, dar păstrează volum în partea superioară. Șaua este joasă fără să coboare pilotul într-o cavitate. Motorul nu este mascat, iar radiatorul este desenat ca o piesă tehnică ordonată, nu ca un secret rușinos.

> Respectul pentru trecut nu obligă designul să îl copieze. Îl obligă doar să înțeleagă de ce anumite proporții au rămas relevante.

## Materialele trebuie să spună adevărul

Aluminiul poate rămâne aluminiu, oțelul poate arăta ca oțel, iar plasticul de calitate nu trebuie vopsit să imite metalul. O motocicletă care îmbătrânește frumos folosește finisajul potrivit pentru rolul fiecărei piese.

Paleta Foundry este intenționat restrânsă:

- Vopsea mată pe suprafețele mari, ușor de citit în lumină
- Aluminiu periat în zonele atinse și observate de aproape
- Elemente structurale negre care ordonează vizual partea mecanică
- Un accent verde discret, folosit ca semn de identitate, nu ca ornament

Șuruburile vizibile sunt aliniate, traseele cablurilor sunt scurte, iar punctele de prindere pentru accesorii fac parte din desen. Calitatea percepută apare adesea acolo unde proiectantul ar fi putut presupune că nimeni nu privește.

## Tehnologia nu are nevoie de deghizare

Iluminarea LED, injecția, ride-by-wire și instrumentarul digital sunt contemporane și sunt tratate ca atare. Farul rotund păstrează o geometrie arhetipală, dar semnătura luminoasă nu imită un bec cu filament. Ecranul este compact și se stinge vizual când motocicleta este oprită; la pornire, oferă informația clar, nu o animație de parc tematic.

Portul USB-C este ascuns pentru că nu trebuie să fie un element de compoziție. Senzorii sunt integrați, nu acoperiți cu piese false. Modernitatea calmă înseamnă că funcția este prezentă exact când ai nevoie de ea.

### Ergonomia este tot design

O clasică nu trebuie să păstreze disconfortul trecutului. Ghidonul, poziția scărițelor și forma șeii sunt stabilite pentru control actual. Înălțimea de 790 mm permite acces ușor la sol, iar triunghiul ergonomic rămâne suficient de deschis pentru un drum de câteva ore.

Forma rezervorului oferă sprijin la frânare. Partea frontală a șeii este îngustă pentru picioare, iar cea posterioară distribuie presiunea. Aceste decizii nu se văd într-o fotografie laterală perfectă, dar definesc relația zilnică dintre obiect și pilot.

## Sunet, vibrație și caracter

Designul nu se termină la suprafață. Ritmul motorului, rezistența comenzilor și felul în care se închide un capac construiesc aceeași impresie. Vibrațiile utile dau informație; cele care amorțesc mâinile sunt doar inginerie neterminată.

Evacuarea este acordată pentru un ton clar la turații joase și medii, fără volum inutil. Maneta de ambreiaj are o cursă previzibilă, accelerația oferă rezistență fină, iar schimbătorul răspunde mecanic. Caracterul nu cere inconveniente ca să pară autentic.

## Testul timpului

O motocicletă poate fi spectaculoasă în anul lansării și obositoare după trei sezoane. Foundry urmărește alt rezultat: să arate firesc când apar primele urme de utilizare și suficient de simplu încât proprietarul să o personalizeze fără să lupte cu designul de bază.

Dacă peste zece ani rezervorul, motorul și roțile continuă să formeze o siluetă coerentă, iar tehnologia încă poate fi folosită fără explicații, proiectul și-a atins scopul. Nu nostalgie. Continuitate.`,
    seoTitle: "Foundry 800: design clasic fără nostalgie artificială",
    seoDescription:
      "Cum combină VERIDIAN Foundry 800 proporțiile clasice, ergonomia și tehnologia modernă într-un design coerent.",
  },
  {
    slug: "quickshifter-ghid",
    category: "Tehnologie",
    categorySlug: "tehnologie",
    title: "Quickshifter: mai rapid, dar și mai lin",
    excerpt: "Cum funcționează și de ce este util și departe de circuit.",
    image: "/images/models/apex-900-rr.webp",
    imageAlt: "VERIDIAN Apex 900 RR în mișcare",
    publishedAt: "2026-05-21T08:00:00.000Z",
    featured: false,
    bodyMarkdown: `## O întrerupere măsurată în milisecunde

La schimbarea în treapta superioară, senzorul montat pe tija schimbătorului detectează presiunea pilotului. Calculatorul motor reduce pentru o fracțiune de secundă cuplul transmis către cutie, iar angrenajele se pot descărca suficient pentru selectarea următoarei trepte fără acționarea ambreiajului.

Evenimentul durează mai puțin decât explicația. Un sistem bine calibrat coordonează aprinderea, injecția și, la motocicletele moderne, poziția clapetei electronice. Rezultatul nu este doar o schimbare rapidă, ci una care păstrează motocicleta stabilă.

## La coborâre, problema este inversă

Pentru retrogradare, transmisia are nevoie de o creștere scurtă a turației motorului. Un quickshifter bidirecțional deschide controlat accelerația, egalizează vitezele și permite intrarea în treapta inferioară. Este versiunea electronică a blip-ului pe care un pilot experimentat îl face manual.

Ambreiajul anti-hopping completează sistemul. El reduce tendința roții spate de a sări sau aluneca atunci când frâna de motor este mare, însă nu poate repara o retrogradare imposibilă pentru viteza aleasă. Protecțiile software refuză de obicei comanda înainte ca motorul să depășească limita.

> Cel mai bun quickshifter nu atrage atenția asupra mecanismului. Face motocicleta să pară mai coerentă.

## De ce este util departe de circuit

Pe circuit, fiecare întrerupere economisită păstrează accelerația și stabilitatea. Pe drum, beneficiul principal este fluiditatea. Într-o depășire poți urca treapta fără să relaxezi poziția, iar pe serpentine poți retrograda fără o succesiune aglomerată de accelerație, ambreiaj și schimbător.

La drum lung, câteva sute de schimbări cu mai puțin efort se simt în antebraț și în atenție. Cu pasager, continuitatea cuplului reduce balansul căștilor și transferurile înainte-înapoi.

## Tehnica face diferența

Un quickshifter bun poate funcționa într-o plajă largă, dar nu toate combinațiile de turație și sarcină sunt la fel de line.

- La urcare, menține accelerația stabilă și aplică o comandă fermă
- Evită schimbările fără ambreiaj la turații foarte joase și sarcină mică
- La coborâre, închide accelerația și lasă sistemul să creeze singur blip-ul
- Nu ține piciorul sprijinit pe schimbător între comenzi
- Folosește ambreiajul când traficul cere finețe sau transmisia pare tensionată

O mișcare ezitantă poate lăsa treapta incomplet selectată. Forța excesivă nu ajută; precizia și momentul potrivit sunt mai importante.

### Când ambreiajul rămâne obligatoriu

Plecare de pe loc, oprire, întoarcere strânsă și mers foarte lent: aici ambreiajul rămâne instrumentul central. La fel și atunci când schimbi treapta în afara plajei recomandate de producător sau când sistemul este dezactivat.

Quickshifterul nu este o cutie automată și nu trebuie tratat ca una. El asistă o comandă mecanică reală. Pilotul continuă să aleagă treapta, să simtă sarcina transmisiei și să decidă când schimbarea are sens.

## De ce unele sisteme sunt mai line

Calibrarea trebuie adaptată fiecărei trepte, turației, poziției accelerației și sensului comenzii. O întrerupere prea lungă produce o pauză perceptibilă; una prea scurtă lasă cutia încărcată. Motoarele cu inerție diferită și cutiile cu rapoarte apropiate cer strategii diferite.

Un sistem premium nu este neapărat cel mai agresiv. Este cel care poate fi aproape imperceptibil într-o accelerare moderată și foarte rapid când accelerația este deschisă. La Apex 900 RR, modurile Road și Track folosesc timpi diferiți tocmai pentru că intenția pilotului se schimbă.

## Semnele unei folosiri greșite

O schimbare izolată mai fermă nu înseamnă o problemă. În schimb, treptele false repetate, zgomotele metalice, refuzul comenzii în plaja normală sau presiunea permanentă necesară în pedală cer verificare. Reglajul tijei, poziția manetei, tensiunea lanțului și actualizarea software pot influența senzația.

Nu încerca să maschezi o transmisie cu probleme folosind mai multă forță. Quickshifterul trebuie să reducă efortul, nu să-l mute în cutia de viteze.

## Mai rapid, dar mai ales mai lin

Cronometrul a făcut tehnologia cunoscută, însă consistența o face valoroasă pe șosea. Un quickshifter bine folosit păstrează șasiul calm, reduce munca pilotului și face accelerarea sau coborârea prin trepte mai curată.

Nu transformă fiecare drum în circuit și nici nu înlocuiește o tehnică bună. Înlătură un gest atunci când acel gest nu aduce nimic experienței — iar asta este, de multe ori, definiția unei tehnologii reușite.`,
    seoTitle: "Quickshifter: cum funcționează și cum îl folosești corect",
    seoDescription:
      "Află cum funcționează quickshifterul la urcare și coborâre, când folosești ambreiajul și cum obții schimbări line.",
  },
];

export function getDemoArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
