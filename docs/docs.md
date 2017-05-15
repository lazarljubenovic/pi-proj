# pi-proj

Za realizaciju sistema za prepoznavanje govora, postavljaju se dva glavna pitanja. Prvo: kako iz niza binarnih podataka, koji predstavljaju odmereni zvučni signal, izvući neku matmatičku veličinu koja predstavlja dati signal? Drugo: kako porediti niz takvih veličina, odnosno definisati način računanja njihove međusobne sličnosti?

Odgovore na ova pitanja daje **izvlačenje karakteristike** (eng. _feature extraction_) i **poređenje karakteristika** (eng. _feature matching_). Ovaj radi se bavi teorijom i implementacijom MFCC i DTW, kao odgovore na postavljena pitanja, respektivno.

## Izvlačenje karakteristika

Prvi korak u bilo kom sistemu za automatsko prepoznavanje govora je **izvlačenje karakteristika** (eng. _feature extraction_), tj. izdvajanje delova zvučnog signala koji su od važnosti za identifikaciju jezičkog sadržaja od onih delova koji nose informacije kao što su pozadinski šumovi, emocije, i tako dalje.

Srž rešenja leži u tome da se zvuci koje proizvodi čovek filtriraju na osnovu oblika vokalnog trakta, što uključuje jezik, zube, itd. Ovaj oblik određuje kakav će zvuk nastati. Oblik voklnog trakta se može predstaviti spektrom, a zadatak MFCC-a jeste da ga prikaže na pogodan način.

MFCC je u širokoj upotrebi za automatsko prepoznavanje govora, jer daje reprezentaciju izgovorenih fonema koje ne zavise od boje glasa i visine tone (bar koliko je to moguće).

Reč "kepstar" je igra reči i dolazi od okretanja redosleda prva četiri slova reči "spektar", jer predstavlja _inverzne_ Furijeove transformacije logaritma spektra signala. Operacije nad kepstrom se slično često nazivaju _analiza kvefrence_ (od "frekvence") i _lifterovanje_ (od "filterovanje").

Računaje MFCC-a se može opisati kroz sledeći niz koraka.

1. Izračunati pektralnu amplitudu primenom Hamingovog prozora.
2. Filterovati signl u spektralnom domenu trogaonom bankom filtera, koji su približno linearno raspoređeni na Melovoj skali, i imaju jednaku širinu u Melovoj skali.
3. Izračunati diskretnu kosinsnu transformaciju logaritamskog spektra.

### Melova skala

Melova skala predstavlja preslikavanje između izmerene frekvece i "doživljene" frekvence. Ljudi mnogo bolje primećuju promene u "piskavosti" tona nižih nego viših frekvencija. Korišćenje Melove skale nam omoguća da karakteristike koje budemo izdvojili iz zvučnog zapisa bolje odgovaraju ljudskom doživljaju zvuka.

Prevođenje frekvence u Melovu skalu obavlja se sledećom formulom.

```
M(f) = 1125 *ln (1 + f/700)
```

### Algoritam

#### Priprema

Sinal se najpre deli na okvire dužine 20 do 40 milisekundi. U konkretnoj implementaciji uzeto je ??. Koraci navedeni u nastavku se odnose na svaki frejm ponaosob.

Rezultat obrade svakog frejma je 12 MFC koeficijenata.

#### DFT

Računa se diskretna Furijeova transformacija (DFT) frejma $S_i (k)$, na osnovu čega se dobija periodogramska procena energetskog spektra.

#### Računanje Melove banke filtera

Ovo je skup od 26 trouglastih filtera koje primenjujemo na dobijenu periodogramsku procenu iz prethodnog koraka. Banka filtera se sastoji od 26 vektora dužine 257 ??. Svaki fektor se uglavnom sastoji od nula, ali ima ne-nulte elemente za određeni deo spektra.

Da bismo izračunali energiju, množimo svaku banku filtera sa energetskim spektrom, i onda saberemo koeficijente.


## Poređenje karakteristika

Dynamic time warping (dinamičko savijanje vremena, DTW) je tehnika za nalaženje optimalnog načina na koji se dve vremenski zavisne sekvence mogu poravnati, tako da budu što sličnije. Treba da otkloni vremensku zavinost, odnosno da "savije" vreme u smislu da proizvoljne sekvence produži, odnosno skrati, kako bi se postiglo bolje poklapanje. Ovo se uklapa u potrebe poklapanja uzoraka ljudskog glasa, jer se na taj način zanemaruje trajanje izgovorene reči, kao i akcenat. Ilustracije radi, izgovor reči "elfaak" i "eelfak" bi imao 100% poklapanje (odnosno imao bi cenu jednaku nuli) jer se produžavanjem slova _a_, i skraćenjem slova _e_ iz prve reči dolazi u drugu.

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






