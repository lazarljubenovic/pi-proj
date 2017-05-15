# pi-proj

Za realizaciju sistema za prepoznavanje govora, postavljaju se dva glavna pitanja. Prvo: kako iz niza binarnih podataka, koji predstavljaju odmereni zvučni signal, izvući neku matmatičku veličinu koja predstavlja dati signal? Drugo: kako porediti niz takvih veličina, odnosno definisati način računanja njihove međusobne sličnosti?

Odgovore na ova pitanja daje **izvlačenje karakteristike** (eng. _feature extraction_) i **poređenje karakteristika** (eng. _feature matching_). Ovaj radi se bavi teorijom i implementacijom MFCC i DTW, kao odgovore na postavljena pitanja, respektivno.

## Izvlačenje karakteristika

Prvi korak u bilo kom sistemu za automatsko prepoznavanje govora je **izvlačenje karakteristika** (eng. _feature extraction_), tj. izdvajanje delova zvučnog signala koji su od važnosti za identifikaciju jezičkog sadržaja od onih delova koji nose informacije kao što su pozadinski šumovi, emocije, i tako dalje.

Srž rešenja leži u tome da se zvuci koje proizvodi čovek filtriraju na osnovu oblika vokalnog trakta, što uključuje jezik, zube, itd. Ovaj oblik određuje kakav će zvuk nastati. Oblik voklnog trakta se može predstaviti spektrom, a zadatak MFCC-a jeste da ga prikaže na pogodan način. U nastavku je opisano dobijanje **Melovih frekventnih "kepstralnih" koeficijenata** (Mel Frequency Cepstral Coefficients, MFCC).

> Reč "kepstar" je igra reči i dolazi od okretanja redosleda prva četiri slova reči "spektar", jer predstavlja _inverzne_ Furijeove transformacije logaritma spektra signala. Operacije nad kepstrom se slično često nazivaju _analiza kvefrence_ (od "frekvence") i _lifterovanje_ (od "filterovanje").

MFCC je u širokoj upotrebi za automatsko prepoznavanje govora, jer daje reprezentaciju izgovorenih fonema koje ne zavise od boje glasa i visine tona. Uspeh MFCC-a je i u mogućnosti kompaktnog zapisa amplitudskog spektra govora. Svaki korak u izdvajanju MFC koeficijanata motivisan je perceptualnim doživljajem ljudskog govora od strane čoveka.

Računaje MFCC-a se može opisati kroz sledeći niz koraka. Polazi se od talasnog oblika.

- Deljenje govornog signala na okvire (frejmove), obično primenom prozora nad fiksniranim intervalima. Cilj je modelovanje malih (obično oko 20ms dugih) odeljaka signala za koje se statistički može reći da su stacionarni. Naravno, zvučni signal se konstantno menja, tako da nikad nije _zapravo_ stacionaran. Zato se i uzimaju ovoliki intervali. Eksperimentalno je dokazano da su dovoljno dugi da sadrže dovoljno uzoraka za procenu spektra, a dovoljno kratki da se ne menjaju previše tokom vremena. Odmerci se provlače kroz funkciju prozora, uglavnom Hamingovu. Na ovaj način se uklanjaju ivični efekti. Rezultat ove faze je kepstralni fektor za svaki okvir.
- Sledeći korak je računanje diskretne Furijeove transformacije (DTF) za svaki okvir. Ovde je od interesa samo logatiram spektra amplitude. Faza se odbacuje jer su perceptualna istraživanja pokazala da amplituda igra mnogo značajniju ulogu, tj. da nosi mnogo više informacija o govoru nego faza. Uzima se logaritam zbog načina na koji ljudsko uho doživljava jačinu zvuka.
- Posle ovoga se "pegla" spektra i naglašavaju se samo frekvence koje su u perceptualnom smislu od značaja. Ovo se postiže skupljanjem (na primer) 256 spektralnih komponenti u (na primer) 40 frekventnih banaka. Ove banke nisu na jednakim rastojanjima jedne od druge, jer čovekov slušni aparat mnogo bolje razlikuje promenu u višim nego u nižim frekvencijama. Zato su banke mnogo tesnije poređane u oblastima nižih frekvencija. Ova skala se naziva Melova skala. Skoro je lineatna izpod jednog kiloherca, a posle toga postaje jasno logaritamska. Prevođenje frekvence u Melovu skalu obavlja se [formulom](https://github.com/meyda/meyda/blob/master/src/utilities.js#L96) `M(f) = 1125 * ln (1 + f/700)`. Naravno, moguće je i [inverzno prevođenje](https://github.com/meyda/meyda/blob/master/src/utilities.js#L91).
- Među komponentama koje se dobijaju javlja se velika korelacija. Utvrđeno je da je dovoljna samo polovina (u [konkretnoj implementaciji ih je 13](https://github.com/meyda/meyda/blob/master/src/extractors/mfcc.js#L39)) kepstralnih karakteristika. Ovime se smanjuje broj parametara sistema što ubrzava izračunavanje i smanjuje neophodni memorijski prostor.
- Dobijene karateristike se transformišu. Mada je moguće primeniti različite transformacije, za prepoznavanje govora se najbolje pokazala [diskretna kosinusna transformacija](https://github.com/meyda/meyda/blob/master/src/extractors/mfcc.js#L39) (DCT).

### Melove banke

Kao što je već rečeno, Melova skala predstavlja preslikavanje između izmerene frekvece i "doživljene" frekvence. Ljudi mnogo bolje primećuju promene u "piskavosti" tona nižih nego viših frekvencija. Korišćenje Melove skale nam omoguća da karakteristike koje budemo izdvojili iz zvučnog zapisa bolje odgovaraju ljudskom doživljaju zvuka. Ovde je opisan način za dobijanje Melove skale, uz linkove do [konkretne implementacije](https://github.com/meyda/meyda/blob/master/src/utilities.js#L104) u korišćenoj biblioteci otvrenog koda Meyda.

Najpre se bira [frekventni opseg od interesa](https://github.com/meyda/meyda/blob/master/src/utilities.js#L110-L111). Po Najkvistu se kao gornja granica uzima polovina frekvence odmeraka. Ove granice se zatim [prevode u Melovu skalu](https://github.com/meyda/meyda/blob/master/src/utilities.js#L114-L115) korišćenjem pomenute [formule](https://github.com/meyda/meyda/blob/master/src/utilities.js#L96). Sada je nad Melovom skalom moguće izvršiti [linearnu interpolaciju](https://github.com/meyda/meyda/blob/master/src/utilities.js#L121).

Kada se Melovi brojevi [prevedu nazad u frekvencu](https://github.com/meyda/meyda/blob/master/src/utilities.js#L131) dobijaju se razlomljeni brojevi, odnosno dobija se veća rezolucija frekvence od postojeće. Zato je potrebno zaokružiti frekvence i [smestiti ih u najbližu FFT banku](https://github.com/meyda/meyda/blob/master/src/utilities.js#L134-L135). Ovaj proces ne utiče na tačnost karakteristika.

Sada se mogu kreirati Melove banke. Prva banka počinje u početnoj tački, doseže maksimum u drugoj tački, i onda se vraća na nulu u trećoj. Druga banka počinje u drugoj tački, doseže maksimum u trećoj i pada na nulu u četvrtoj. [I tako dalje.](https://github.com/meyda/meyda/blob/master/src/utilities.js#L146-L155)

## Poređenje karakteristika

Nakon što su karakteristike izdvojene iz zvučnog signala, neophnodno je na neki način **porediti dobijene karakteristike**, kako bi se procenila njihova sličnost i na taj način utvrdilo da li se u oba zvučna signala radi o istoj izgovorenoj reči. Ovde je opisan DTW.

**Dynamic time warping** (dinamičko savijanje vremena, DTW) je tehnika za nalaženje optimalnog načina na koji se dve vremenski zavisne sekvence mogu poravnati, tako da budu što sličnije. Treba da otkloni vremensku zavinost, odnosno da "savije" vreme u smislu da proizvoljne sekvence produži, odnosno skrati, kako bi se postiglo bolje poklapanje. Ovo se uklapa u potrebe poklapanja uzoraka ljudskog glasa, jer se na taj način zanemaruje trajanje izgovorene reči, kao i akcenat. Ilustracije radi, izgovor reči "elfaak" i "eelfak" bi imao 100% poklapanje (odnosno imao bi cenu jednaku nuli) jer se produžavanjem slova _a_, i skraćenjem slova _e_ iz prve reči dolazi u drugu.

Formalno rečeno, cilj DTW-a je da uporedi dve vremenski zavisne sekvence `X = (x1, x2, ... xN)` dužine `N` i `Y = (y1, y2, ..., yM)`, dužine `M`. U opštem slučaju, ovi nizovi mogu biti karakteristike odmerene nad tačkama u vremenu na jednakoj razdaljini. U praksi, ovo znači da se radi o diskretnim signalima koji su opisani nekim vektorom (u našem slučaju svaki od članova sekvence predstavlja vektor koji sačinjava 13 skalara dobijenih na osnovu MFCC-a). Ako _prostor karakteristike_ obeležimo sa `F`, možemo reći da DTW algoritam treba da kao rezultat da cenu `c`, koja predstavlja preslikavanje Dekartovog proizvoda dva ovakva skupa (`F × F`) u skup ne-negativnih realnih brojeva. Kažemo da između dva podskupa ovih prostora (npr. dva različita snimka izgovorene reči) postoji _dobro preklapanje_ ako je cena mala, i _loše preklapanje_ ako je cena velika.

Niz uređenih parova `(x, y)`, pri čemu su `x` i `y` elementi vektora `X` i `Y` iz prostora `F` čije se upoređivanje vrši, nazivamo **savijenom putanjom**. Ovaj lanac možemo predstaviti matricom. Na primer, za pomenute reči "eelfak" i "elfaak", putanja bi se savijala na sledeći način.

```
  E E L F A K
E x x . . . .
L . . x . . .
F . . . x . .
A . . . . x .
A . . . . x .
K . . . . . x
```

Horizonalna linija predstavlja deo gde je "vreme stalo" za sekvencu _EE_ (ili, posmatrano iz drugog ugla, "produžilo" se za _E_), kako bi se dobilo dobro preklapanje za sekvencu _LF_. Slično se zatim "vreme produžava" za _A_.

Mada su intuitivna, u nastavku su navedena ograničenja koja mora da zadovolji savijena putanja kako bi bila od koristi za prepoznavanje govora.

- Granični uslov: prvi uređeni par je `(1, 1)` a poslednji uređeni par je `(N, M)`, gde su `N` i `M`, dužine vektora između kojih se vrši preklapanje.
- Uslov monotonosti: niz sačinjen od prvih, odnosno drugih, elementa uređenih parova savijene putanje mora biti neopadajući.

Prvi uslov se može ilustrovati poređenjem reči _elfak_ i _elfakultet_. Jasno je da putanja glatko "klizi" niz sekvencu slova _elfak_, ali ne može da se završi tu: mora se izvršiti "savijanje" u smislu da se sekvenca _ultet_ "skrati" i "umetne" zajedno sa _k_.

```
  E L F A K U L T E T
E x . . . . . . . . .
L . x . . . . . . . .
F . . x . . . . . . .
A . . . x . . . . . . 
K . . . . x x x x x x
```

Drugi uslov je takođe očigledan: nema vraćanja unazad. Na primer, u rečima "ana" i "banana", put ne može izgledati kao što je prikazano s leve strane na sledećoj slici, već kao što je prikazano zdesna.

```
  B A N A N A        B A N A N A 
A x x . . . .      A x x . . . .
N . . x . x .      N . . x . . .
A . . . x . x      A . . . x x x
```

Ovi uslovi su potrebni i dovoljni u opštem slučaju, ali se obično nameće još jedan uslov, a to je _uslov veličine koraka_. Odnosno, koliko se daleko u matrici može "skočiti". Ovo zavisi od konkretne potrebe u zavinosti od toga kolika je preciznost i brzina potrebna. Standardno se uzimaju koraci `(1, 0)`, `(0, 1)` i `(1, 1)` (desno, dole, desno-dole dijagonalno).

Nije uvek moguće naći savršeno poklapanje (sa cenom jednakom nuli), kao što je primer u rečima _eelfak_ i _elfaak_. Na primer, između reči _truba_ i _gruba_ nemoguće je preklopiti prva slova, ali je putanja i dalje očigledno strogo dijagonalna.

```
  T R U B A
G x . . . .
R . x . . .
U . . x . . 
B . . . x .
A . . . . x
```

Zato se, osim putanje, govori i o njenoj **ceni**. Jasno je da je neophodno definisati metriku na osnovu koje će se porediti dva uzorka koja se trenutno ispituju. Na primer, za rastojanje između dva vektora se može uzeti Euklidova distanca između njih.

Cena puta se definiše kao suma svih pojedinačnih cena između odgovarjaućih vektora na putanji. Zadatak DTW algoritma je da pronađe optimalnu cenu i odgovarajuću optimalnu putanju. U opštem slučaju optimalna savijena putanja ne mora da bude jedinstvena, ali se ovakve situacije retko sreću u praksi.

Za određivanje optimalne putanje `p`, može se testirati svaka moguća savijena putanja između `X` i `Y`. Međutim, ovakav postupak bi imao eksponencijalnu složenost koji zavisi od dućina vektora `X` i `Y`, što nikako nisu mali brojevi. Ako definišemo prefikse sekvenci `X` i `Y` dužina `n` i `m` kao `X(1:n)` i `Y(1:m)` (gde je `n` između `1` i `N`, a `m` između `1` i `M`), kumulativna cena u tački `(n, m)` možemo definisati kao

```
D(n, m) = DTW(X(1:n), Y(1;m)).
```

Očigledno je da je `D(N, M) = DTW(X, Y)`, što predstavlja cenu koju tražimo.

Odavde proizilaze sledeće rekurzivne formule kojima se može izračunati cena.

> Kumulativna cena matrice `D` zadovoljava sledeće identitete:
>
> - `D(n, 1) = sum(c(xi, y1))`
> - `D(1, m) = sum(c(x1, yi))`
> - `D(n, m) = min{ D(n-1,m-1) , D(n,m-1) , D(n-1,m) } + c(xn, ym)`

Navedena definicija je rekurzivna, pa se pribegava _dinamičkom programiranju_, koje daje sasvim zadovoljavajuće rešenje složenosti `O(NM)`, gde su `N` i `M` dužine vektora `X` i `Y`. [Incijalizacija](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L6-L10) se može pojednostaviti ako se matrica proširi [dodatnim redom](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L6) i [dodatnom kolonom](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L7), pri čemu se postavljaju [početni uslovi `D(n, 0) = Infinity` (za sve `n` između `1` i `N`), `D(0, m) = Infinity` (za sve `m` između `1` i `M`)](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L8), i [`D(0, 0) = 0` (početna cena je jednaka nuli)](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L10).

Ovim uslovima su izbačena prva dva od tri identita, jer sa ovom ekstenzijom matrice uvek važi samo treći uslov, što značajno ubrzava izračunavanje ([nema grananja u petlji](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L14-L19)), po cenu malog dodatnog utroška memorije. Štaviše, ovo za sobom povlači da se matrica može računati po kolonama, jer je za `m`-tu kolonu potrebno samo poznavanje kolone sa indeksom `(m-1)`. Ovo znači da ukoliko je potrebno samo računanje vrednosti `DTW(X, Y) = D(N, M)`, a ne poznavanje cele putanje, dovoljno je odvojiti samo `O(N)` memorijskog prostora. Slično, ako se umesto kolona izaberu redovi, dovoljno je `O(M)`. Ipak, u oba slučaja je vremenska kompleksnost `O(NM)`. Štaviše, da bi se dobila cela putanja, potrebno je [izračunati sve elemente `N × M` matrice](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L12-L13).

Da bi se pronašla dobijenja putanja, može se [krenuti od prve ćelije matrice](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L23-L24) (zanemarujući dodatnu vrstu i kolonu), i [obilaziti matricu do njenih granica](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L25), pritom [prateći najjeftiniji put](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L30-L37) i [čuvajući indekse obiđenih ćelija](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L38). Zbog prvog uslova DTW putanje (granični uslov), putanja mora da se završi u donjem-levom uglu matrice, pa je, ukoliko to već nije slučaj, potrebno ["skliznuti"](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L40-L41) naniže ili udesno [do poslednje ćelije](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L42).

Rezultat algoritma je ne samo [cena (distanca)](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L45), već i [putanja](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L47). Konkretna implementacija kao izlaz ima i [matricu (bez dodatne vrste i kolone)](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L46) radi [vizuelzacije](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/utils.js#L69-L98).

## Implementacija i tok aplikacije

Aplikacija je implementirana kao veb-aplikacija i u osnovi koristi [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API). DTW je [implementiran](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js) kao [funkcija](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/dtw.js#L57), a za MFCC se [koristi](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L42-L54) implementacija iz biblioteke [Meyda](https://github.com/hughrawlinson/meyda). Kao front-end biblioteka koristi se Fejsbukov [React](https://facebook.github.io/react/). U nastavku je dat tok aplikacije sa linkovima od interesa.

- Od korisnika se zahteva [dozvola za korišćenjem mikrofona](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L13) i incijalizauje se [`MediaRecorder`](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L14) za snimanje zvuka.
- Tokom celog rada aplikacije, pribavlja se [informacija o frekvenci trenutnog zvučnog signala snimljenog sa mikrofona](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L53-L57) i [iscrtava se odgavrajuća vizuelizacija u HTML5 Canvasu](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L66).
- Klikom na [dugme sa mikrofonom](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L132-L139), [počinje snimanje](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L103-L109). Snimanje traje [maksimalno dve sekunde](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L108) (ali može biti i prekinuto ponovnim klikom na dugme). [Počinje](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L103) izvlačenje [MFCC](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L47)-a.
- Ponovnim klikom na dugme (ili nakon isteka vremena), [snimanje se zaustavlja](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L111-L117). [Prestaje računanje MFCC-a](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L113). [Postavlja se novo stanje](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L114) komponente (koje sadrži MFCC snimljenog glasa) i React ažurira [komponentu `Results`](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Recorder.jsx#L145), kojoj prosleđuje snimljeni glas, ali ga prethodno [odseca](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/utils.js#L123). Odsecanje se vrši tako što se uklanjaju "ivični" vektori gde nijedna komponenta vektora nije veća od `-1`. Ovime se uklanja tišina koja omeđuje izgovorenu reč.
- Komponenta `Results`, [svaki put kada primi novi zvučni signal](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Results.jsx#L20), [za svaki postojeći uzorak](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Results.jsx#L21) pokreće DTW spram dobijenog zvučnog signala. Traži i koji uzorak je imao [najmanju cenu](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Results.jsx#L22) i njega [uokvirava crvenom bojom](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Results.jsx#L37). Sračunate podatke [prosleđuje](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Results.jsx#L41-L42) komponenti za vizuelizaciju, [`Comparison`](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Comparison.jsx). Ovde se [iscrtavaju dva spektograma (uzorak i dobijeni signal), kao i matrica](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Comparison.jsx#L23-L25). Beleži se i tačna [vrednost distance, tj. cena](https://github.com/lazarljubenovic/pi-proj/blob/master/src/components/Comparison.jsx#L62).

Opisani postupak se može ponavljati proizvoljan broj puta, bez ponovnog pokretanja aplikacije. MFCC je pokrenut nad uzorcima snimaka brojeva od 1 do 10, izgovorenih na srpskom jeziku, dobijeni podaci su [sačuvani](https://github.com/lazarljubenovic/pi-proj/blob/master/src/services/mfcc-data.js) i automatski se učitavaju prilikom prvog pokretanja aplikacije.
