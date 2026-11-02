# Gemini-opsætning

AI-siden sender kun kalenderdata til Gemini, når brugeren trykker “Lav min dagsplan”.
Nøglen tilhører serveren og må aldrig skrives i klientkoden, kalenderen eller chatten.

1. Slet den tidligere delte nøgle i Google AI Studio, og opret en ny.
2. Gem den nye nøgle som Sites runtime secret `GEMINI_API_KEY` for det eksisterende projekt.
3. Genudgiv den senest gemte version, så serveren får indstillingen.
4. Åbn “Dagens anbefaling”, og kontrollér en anbefaling med testvideoer.

En ny nøgle kan også afleveres til agenten via den lokale, Git-ignorerede fil
`.sites-runtime/gemini-key.txt` ved hjælp af den lokale editor. Skriv kun nøglen i filen.
Agenten skal læse den uden at udskrive den, gemme den med Sites' native secret-værktøj,
slette filens indhold og genudgive. En lokal fil alene aktiverer ikke den hostede AI.

Ingen nøgle er konfigureret af denne ændring. Live Gemini-kald er derfor ikke verificeret.
