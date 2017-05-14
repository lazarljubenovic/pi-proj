# pi-proj

Za realizaciju sistema za prepoznavanje govora, postavljaju se dva glavna pitanja. Prvo: kako iz niza binarnih podataka, koji predstavljaju odmereni zvučni signal, izvući neku matmatičku veličinu koja predstavlja dati signal? Drugo: kako porediti niz takvih veličina, odnosno definisati način računanja njihove međusobne sličnosti?

Odgovore na ova pitanja daje **izvlačenje karakteristike** (eng. _feature extraction_) i **poređenje karakteristika** (eng. _feature matching_). Ovaj radi se bavi teorijom i implementacijom MFCC i DTW, kao odgovore na postavljena pitanja, respektivno.

## Izvlačenje karakteristika

Prvi korak u bilo kom sistemu za automatsko prepoznavanje govora je **izvlačenje karakteristika** (eng. _feature extraction_), tj. izdvajanje delova zvučnog signala koji su od važnosti za identifikaciju jezičkog sadržaja od onih delova koji nose informacije kao što su pozadinski šumovi, emocije, i tako dalje.

Srž rešenja leži u tome da se zvuci koje proizvodi čovek filtriraju na osnovu oblika vokalnog trakta, što uključuje jezik, zube, itd. Ovaj oblik određuje kakav će zvuk nastati. Oblik voklnog trakta se može predstaviti spektrom, a zadatak MFCC-a jeste da ga prikaže na pogodan način.

MFFC je u širokoj upotrebi za automatsko prepoznavanje govora, jer daje reprezentaciju izgovorenih fonema koje ne zavise od boje glasa i visine tone (bar koliko je to moguće).


### Izvačenje karakteristika

#### MFCC
http://www.ifs.tuwien.ac.at/~schindler/lectures/MIR_Feature_Extraction.html#Mel-Frequency-Cepstral-Coefficients-(MFCC)


### Poređenje karakteristika
