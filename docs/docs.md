# pi-proj

Za realizaciju sistema za prepoznavanje govora, postavljaju se dva glavna pitanja. Prvo: kako iz niza binarnih podataka, koji predstavljaju odmereni zvučni signal, izvući neku matmatičku veličinu koja predstavlja dati signal? Drugo: kako porediti niz takvih veličina, odnosno definisati način računanja njihove međusobne sličnosti?

Odgovore na ova pitanja daje **izvlačenje karakteristike** (eng. _feature extraction_) i **poređenje karakteristika** (eng. _feature matching_). Ovaj radi se bavi teorijom i implementacijom MFCC i DTW, kao odgovore na postavljena pitanja, respektivno.

## Izvlačenje karakteristika

Prvi korak u bilo kom sistemu za automatsko prepoznavanje govora je **izvlačenje karakteristika** (eng. _feature extraction_), tj. izdvajanje delova zvučnog signala koji su od važnosti za identifikaciju jezičkog sadržaja od onih delova koji nose informacije kao što su pozadinski šumovi, emocije, i tako dalje.

Srž rešenja leži u tome da se zvuci koje proizvodi čovek filtriraju na osnovu oblika vokalnog trakta, što uključuje jezik, zube, itd. Ovaj oblik određuje kakav će zvuk nastati. Oblik voklnog trakta se može predstaviti spektrom, a zadatak MFCC-a jeste da ga prikaže na pogodan način.

MFFC je u širokoj upotrebi za automatsko prepoznavanje govora, jer daje reprezentaciju izgovorenih fonema koje ne zavise od boje glasa i visine tone (bar koliko je to moguće).

Reč "kepstar" je igra reči i dolazi od okretanja redosleda prva četiri slova reči "spektar", jer predstavlja _inverzne_ Furijeove transformacije logaritma spektra signala. Operacije nad kepstrom se slično često nazivaju _analiza kvefrence_ (od "frekvence") i _lifterovanje_ (od "filterovanje").

Računaje MFCC-a se može opisati kroz sledeći niz koraka.

1. Izračunati pektralnu amplitudu primenom Hamingovog prozora.
2. Filterovati signl u spektralnom domenu trogaonom bankom filtera, koji su približno linearno raspoređeni na Melovoj skali, i imaju jednaku širinu u Melovoj skali.
3. Izračunati diskretnu kosinsnu transformaciju logaritamskog spektra.

### Melova skala

Melova skala predstavlja preslikavanje između izmerene frekvece i "doživljene" frekvence. Ljudi mnogo bolje primećuju promene u "piskavosti" tona nižih nego viših frekvencija. Korišćenje Melove skale nam omoguća da karakteristike koje budemo izdvojili iz zvučnog zapisa bolje odgovaraju ljudskom doživljaju zvuka.

Prevođenje frekvence u Melovu skalu obavlja se sledećom formulom.

$$ M(f) = 1125 \ln (1 + \frac{f}{700}) $$

### Algoritam

#### Priprema

Sinal se najpre deli na okvire dužine 20 do 40 milisekundi. U konkretnoj implementaciji uzeto je ??. Koraci navedeni u nastavku se odnose na svaki frejm ponaosob.

Rezultat obrade svakog frejma je 12 MFC koeficijenata.

#### DFT

Računa se diskretna Furijeova transformacija (DFT) frejma $S_i (k)$, na osnovu čega se dobija periodogramska procena energetskog spektra.

#### Računanje Melove banke filtera

Ovo je skup od 26 trouglastih filtera koje primenjujemo na dobijenu periodogramsku procenu iz prethodnog koraka. Banka filtera se sastoji od 26 vektora dužine 257 ??. Svaki fektor se uglavnom sastoji od nula, ali ima ne-nulte elemente za određeni deo spektra.

Da bismo izračunali energiju, množimo svaku banku filtera sa energetskim spektrom, i onda saberemo koeficijente.


### Poređenje karakteristika
