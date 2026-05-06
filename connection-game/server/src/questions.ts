// Sprint 3: ~150 Fragen, 3 Kategorien × 3 Tiefe-Stufen.
// Tiefe-Stufen:
//  - leicht: Eisbrecher, witzig, Kennenlern-Smalltalk
//  - persoenlich: Ehrlich, etwas verletzlich, "echte" Antworten
//  - intensiv: Tief, unangenehm, manchmal schmerzhaft

export type Category = 'lustig' | 'deepTalk' | 'hotTakes';
export type Depth = 'leicht' | 'persoenlich' | 'intensiv';

export type Question = {
  id: string;
  text: string;
  category: Category;
  depth: Depth;
};

export const QUESTIONS: Question[] = [
  // ===== LUSTIG & ALBERN =====

  // 🟢 leicht
  { id: 'lus-l-01', category: 'lustig', depth: 'leicht', text: 'Welches peinliche Lied hörst du heimlich gerne?' },
  { id: 'lus-l-02', category: 'lustig', depth: 'leicht', text: 'Wenn du als Tier wiedergeboren würdest – welches passt zu dir?' },
  { id: 'lus-l-03', category: 'lustig', depth: 'leicht', text: 'Was ist dein absolutes Comfort-Food, wenn alles schiefläuft?' },
  { id: 'lus-l-04', category: 'lustig', depth: 'leicht', text: 'Welches Outfit aus deiner Teenager-Zeit ist heute peinlich?' },
  { id: 'lus-l-05', category: 'lustig', depth: 'leicht', text: 'Was war dein erster Kindheits-Traumberuf?' },
  { id: 'lus-l-06', category: 'lustig', depth: 'leicht', text: 'Welche unnütze Fähigkeit beherrschst du erstaunlich gut?' },
  { id: 'lus-l-07', category: 'lustig', depth: 'leicht', text: 'Welches Hobby würdest du nie offen zugeben?' },
  { id: 'lus-l-08', category: 'lustig', depth: 'leicht', text: 'Welche Kindheitsserie verteidigst du heute noch?' },
  { id: 'lus-l-09', category: 'lustig', depth: 'leicht', text: 'Welcher Promi soll dir angeblich ähneln?' },
  { id: 'lus-l-10', category: 'lustig', depth: 'leicht', text: 'Welche Speise fandst du als Kind eklig und liebst sie heute?' },
  { id: 'lus-l-11', category: 'lustig', depth: 'leicht', text: 'Welches Fast-Food-Restaurant ist deine geheime Schwäche?' },
  { id: 'lus-l-12', category: 'lustig', depth: 'leicht', text: 'Welcher Smiley/Emoji rutscht dir am häufigsten raus?' },
  { id: 'lus-l-13', category: 'lustig', depth: 'leicht', text: 'Was wäre dein Stripper-Name (erstes Haustier + erste Straße)?' },
  { id: 'lus-l-14', category: 'lustig', depth: 'leicht', text: 'Welcher Film bringt dich jedes Mal zum Heulen?' },
  { id: 'lus-l-15', category: 'lustig', depth: 'leicht', text: 'Was wäre der Titel deiner Autobiografie in 5 Wörtern?' },
  { id: 'lus-l-16', category: 'lustig', depth: 'leicht', text: 'Was war dein dümmster Mutprobe-Moment als Kind?' },
  { id: 'lus-l-17', category: 'lustig', depth: 'leicht', text: 'Welches Kompliment hörst du gerne, weißt aber, dass es nicht ganz stimmt?' },

  // 🟡 persoenlich
  { id: 'lus-p-01', category: 'lustig', depth: 'persoenlich', text: 'Was ist die seltsamste Angewohnheit, die du heimlich pflegst?' },
  { id: 'lus-p-02', category: 'lustig', depth: 'persoenlich', text: 'Was war dein cringiester Moment in der Schul- oder Studienzeit?' },
  { id: 'lus-p-03', category: 'lustig', depth: 'persoenlich', text: 'Was würdest du tun, wenn du für einen Tag unsichtbar wärst?' },
  { id: 'lus-p-04', category: 'lustig', depth: 'persoenlich', text: 'Was ist die peinlichste Suchanfrage in deinem Browser-Verlauf?' },
  { id: 'lus-p-05', category: 'lustig', depth: 'persoenlich', text: 'Welche peinliche Phase hattest du als Teenager?' },
  { id: 'lus-p-06', category: 'lustig', depth: 'persoenlich', text: 'In wen warst du heimlich verschossen, ohne dass es jemand wusste?' },
  { id: 'lus-p-07', category: 'lustig', depth: 'persoenlich', text: 'Welche Ausrede benutzt du am häufigsten, um was zu canceln?' },
  { id: 'lus-p-08', category: 'lustig', depth: 'persoenlich', text: 'Welche soziale Situation übst du innerlich, bevor du sie machst?' },
  { id: 'lus-p-09', category: 'lustig', depth: 'persoenlich', text: 'Worüber hast du zuletzt gelacht, obwohl es nicht lustig war?' },
  { id: 'lus-p-10', category: 'lustig', depth: 'persoenlich', text: 'Welches Lied bringt dich immer zum Mitsingen, egal wo?' },
  { id: 'lus-p-11', category: 'lustig', depth: 'persoenlich', text: 'Welchen Streich hast du jemandem gespielt, den du heute bereust?' },
  { id: 'lus-p-12', category: 'lustig', depth: 'persoenlich', text: 'Was würden deine Eltern niemals erfahren dürfen?' },
  { id: 'lus-p-13', category: 'lustig', depth: 'persoenlich', text: 'Was war deine peinlichste Date-Situation?' },
  { id: 'lus-p-14', category: 'lustig', depth: 'persoenlich', text: 'Welcher Tick verrät dich, wenn du lügst?' },
  { id: 'lus-p-15', category: 'lustig', depth: 'persoenlich', text: 'Was war das Letzte, das du gegoogelt hast und wofür du dich schämst?' },
  { id: 'lus-p-16', category: 'lustig', depth: 'persoenlich', text: 'Welchen Gesichtsausdruck machst du, wenn du allein bist und nichts denkst?' },
  { id: 'lus-p-17', category: 'lustig', depth: 'persoenlich', text: 'Wann hast du zuletzt jemanden angelogen, um Smalltalk zu beenden?' },

  // 🔴 intensiv
  { id: 'lus-i-01', category: 'lustig', depth: 'intensiv', text: 'Welcher cringe Moment hält dich heute noch nachts wach?' },
  { id: 'lus-i-02', category: 'lustig', depth: 'intensiv', text: 'Was war deine schlimmste Lüge, an die du heute noch denkst?' },
  { id: 'lus-i-03', category: 'lustig', depth: 'intensiv', text: 'Welche Phase deines Lebens würdest du am liebsten löschen?' },
  { id: 'lus-i-04', category: 'lustig', depth: 'intensiv', text: 'Was war das Albernste, was du jemals aus Liebe gemacht hast?' },
  { id: 'lus-i-05', category: 'lustig', depth: 'intensiv', text: 'Welche Marotte deiner Eltern hast du übernommen, obwohl du sie hasst?' },
  { id: 'lus-i-06', category: 'lustig', depth: 'intensiv', text: 'Was hast du dir selbst eingeredet, das heute lächerlich klingt?' },
  { id: 'lus-i-07', category: 'lustig', depth: 'intensiv', text: 'Welches Kompliment bekommst du oft, das du innerlich ablehnst?' },
  { id: 'lus-i-08', category: 'lustig', depth: 'intensiv', text: 'Welches Gerücht über dich war wahr, obwohl du es immer abgestritten hast?' },
  { id: 'lus-i-09', category: 'lustig', depth: 'intensiv', text: 'Welche unwahre Geschichte über dich erzählst du immer wieder?' },
  { id: 'lus-i-10', category: 'lustig', depth: 'intensiv', text: 'Welche Fähigkeit hast du dir nur angeeignet, um anderen zu imponieren?' },
  { id: 'lus-i-11', category: 'lustig', depth: 'intensiv', text: 'Worüber lügst du systematisch, obwohl es egal wäre?' },
  { id: 'lus-i-12', category: 'lustig', depth: 'intensiv', text: 'Was hast du letzte Woche gemacht, was du keinem hier gestehen würdest?' },
  { id: 'lus-i-13', category: 'lustig', depth: 'intensiv', text: 'Welcher Tick deines Partners/deiner Familie nervt dich, ohne dass du es sagst?' },
  { id: 'lus-i-14', category: 'lustig', depth: 'intensiv', text: 'Welche Vorliebe von dir würdest du nie auf einem ersten Date erwähnen?' },
  { id: 'lus-i-15', category: 'lustig', depth: 'intensiv', text: 'Welche kleine Lüge erzählst du Menschen, die du eigentlich magst?' },

  // ===== DEEP TALK =====

  // 🟢 leicht
  { id: 'dt-l-01', category: 'deepTalk', depth: 'leicht', text: 'Was macht dich aktuell am glücklichsten?' },
  { id: 'dt-l-02', category: 'deepTalk', depth: 'leicht', text: 'Was ist deine persönliche Definition von Erfolg?' },
  { id: 'dt-l-03', category: 'deepTalk', depth: 'leicht', text: 'Welche Lektion deiner Eltern trägst du am meisten mit dir?' },
  { id: 'dt-l-04', category: 'deepTalk', depth: 'leicht', text: 'Wofür bist du heute besonders dankbar?' },
  { id: 'dt-l-05', category: 'deepTalk', depth: 'leicht', text: 'Was ist deine größte Stärke, die andere oft übersehen?' },
  { id: 'dt-l-06', category: 'deepTalk', depth: 'leicht', text: 'Welche Frage stellst du dir selbst regelmäßig?' },
  { id: 'dt-l-07', category: 'deepTalk', depth: 'leicht', text: 'Wie sieht dein perfekter Sonntag aus?' },
  { id: 'dt-l-08', category: 'deepTalk', depth: 'leicht', text: 'Was war das Beste, was dir dieses Jahr passiert ist?' },
  { id: 'dt-l-09', category: 'deepTalk', depth: 'leicht', text: 'Welcher Mensch hat dich geprägt, ohne es zu wissen?' },
  { id: 'dt-l-10', category: 'deepTalk', depth: 'leicht', text: 'Was war ein kleiner Moment, der dich kürzlich glücklich gemacht hat?' },
  { id: 'dt-l-11', category: 'deepTalk', depth: 'leicht', text: 'Welche Eigenschaft schätzt du an deinen Freunden am meisten?' },
  { id: 'dt-l-12', category: 'deepTalk', depth: 'leicht', text: 'Was ist dein liebster Ort der Welt und warum?' },
  { id: 'dt-l-13', category: 'deepTalk', depth: 'leicht', text: 'Welches Buch oder welcher Film hat deine Sicht aufs Leben verändert?' },
  { id: 'dt-l-14', category: 'deepTalk', depth: 'leicht', text: 'Was ist deine schönste Kindheits-Erinnerung?' },
  { id: 'dt-l-15', category: 'deepTalk', depth: 'leicht', text: 'Was würdest du dir selbst mit 16 raten?' },
  { id: 'dt-l-16', category: 'deepTalk', depth: 'leicht', text: 'Was war die beste Entscheidung der letzten 5 Jahre?' },
  { id: 'dt-l-17', category: 'deepTalk', depth: 'leicht', text: 'Welcher Song fasst gerade deine Lebensphase zusammen?' },

  // 🟡 persoenlich
  { id: 'dt-p-01', category: 'deepTalk', depth: 'persoenlich', text: 'Wovor hast du Angst, wenn du an die Zukunft denkst?' },
  { id: 'dt-p-02', category: 'deepTalk', depth: 'persoenlich', text: 'Welcher Traum begleitet dich, den du noch keinem erzählt hast?' },
  { id: 'dt-p-03', category: 'deepTalk', depth: 'persoenlich', text: 'Was ist die größte Herausforderung, der du dich gerade stellst?' },
  { id: 'dt-p-04', category: 'deepTalk', depth: 'persoenlich', text: 'Was ist eine Sache, die du dir selbst nie verzeihen wirst?' },
  { id: 'dt-p-05', category: 'deepTalk', depth: 'persoenlich', text: 'Was ist der beste Rat, den du je bekommen hast?' },
  { id: 'dt-p-06', category: 'deepTalk', depth: 'persoenlich', text: 'Was würde dein 10-jähriges Ich heute über dich denken?' },
  { id: 'dt-p-07', category: 'deepTalk', depth: 'persoenlich', text: 'Wann hast du dich zuletzt wirklich stolz auf dich gefühlt?' },
  { id: 'dt-p-08', category: 'deepTalk', depth: 'persoenlich', text: 'Was würdest du anders machen, wenn du nicht so viel Angst hättest?' },
  { id: 'dt-p-09', category: 'deepTalk', depth: 'persoenlich', text: 'Welche Maske setzt du am häufigsten auf, ohne dass es jemand merkt?' },
  { id: 'dt-p-10', category: 'deepTalk', depth: 'persoenlich', text: 'Was ist deine größte Unsicherheit, die du gut versteckst?' },
  { id: 'dt-p-11', category: 'deepTalk', depth: 'persoenlich', text: 'Welche Beziehung in deinem Leben würdest du gerne reparieren?' },
  { id: 'dt-p-12', category: 'deepTalk', depth: 'persoenlich', text: 'Was möchtest du können, wenn du 70 bist, was du jetzt nicht kannst?' },
  { id: 'dt-p-13', category: 'deepTalk', depth: 'persoenlich', text: 'Welches Versprechen an dich selbst hältst du regelmäßig nicht?' },
  { id: 'dt-p-14', category: 'deepTalk', depth: 'persoenlich', text: 'Was bedeutet "Heimat" für dich emotional?' },
  { id: 'dt-p-15', category: 'deepTalk', depth: 'persoenlich', text: 'Was ist deine größte Sehnsucht, über die du nie sprichst?' },
  { id: 'dt-p-16', category: 'deepTalk', depth: 'persoenlich', text: 'Was musst du loslassen, um weiterzukommen?' },
  { id: 'dt-p-17', category: 'deepTalk', depth: 'persoenlich', text: 'Wann hast du dich zuletzt wirklich verstanden gefühlt – und von wem?' },

  // 🔴 intensiv
  { id: 'dt-i-01', category: 'deepTalk', depth: 'intensiv', text: 'Wenn du wüsstest, dass du in einem Jahr stirbst – was würdest du ändern?' },
  { id: 'dt-i-02', category: 'deepTalk', depth: 'intensiv', text: 'Welche Entscheidung in deinem Leben bereust du am meisten?' },
  { id: 'dt-i-03', category: 'deepTalk', depth: 'intensiv', text: 'Wem hast du nie gesagt, was du wirklich für ihn empfindest?' },
  { id: 'dt-i-04', category: 'deepTalk', depth: 'intensiv', text: 'Welcher schmerzhafte Moment hat dich zu der Person gemacht, die du heute bist?' },
  { id: 'dt-i-05', category: 'deepTalk', depth: 'intensiv', text: 'Was würdest du tun, wenn du wüsstest, dass du nicht scheitern kannst?' },
  { id: 'dt-i-06', category: 'deepTalk', depth: 'intensiv', text: 'Wofür möchtest du in Erinnerung bleiben?' },
  { id: 'dt-i-07', category: 'deepTalk', depth: 'intensiv', text: 'Was war deine dunkelste Stunde – und wer hat dir geholfen?' },
  { id: 'dt-i-08', category: 'deepTalk', depth: 'intensiv', text: 'Welcher Verlust hat dich am tiefsten verändert?' },
  { id: 'dt-i-09', category: 'deepTalk', depth: 'intensiv', text: 'Wem schuldest du eine Entschuldigung, die du nie ausgesprochen hast?' },
  { id: 'dt-i-10', category: 'deepTalk', depth: 'intensiv', text: 'Was würdest du jemandem sagen, den du verloren hast und nicht mehr erreichen kannst?' },
  { id: 'dt-i-11', category: 'deepTalk', depth: 'intensiv', text: 'Welche Wahrheit über dich hast du noch nie ausgesprochen?' },
  { id: 'dt-i-12', category: 'deepTalk', depth: 'intensiv', text: 'Welche Lüge erzählst du dir selbst am häufigsten?' },
  { id: 'dt-i-13', category: 'deepTalk', depth: 'intensiv', text: 'Welche Wunde aus der Vergangenheit beeinflusst noch heute deine Beziehungen?' },
  { id: 'dt-i-14', category: 'deepTalk', depth: 'intensiv', text: 'Vor was läufst du gerade weg?' },
  { id: 'dt-i-15', category: 'deepTalk', depth: 'intensiv', text: 'Was würdest du in den letzten 24 Stunden deines Lebens tun?' },
  { id: 'dt-i-16', category: 'deepTalk', depth: 'intensiv', text: 'Wer in deinem Leben kennt dich am wenigsten, sollte dich aber gut kennen?' },
  { id: 'dt-i-17', category: 'deepTalk', depth: 'intensiv', text: 'Welche Person in diesem Raum würdest du gerne besser kennenlernen, traust dich aber nicht?' },

  // ===== HOT TAKES =====

  // 🟢 leicht
  { id: 'ht-l-01', category: 'hotTakes', depth: 'leicht', text: 'Welcher beliebte Film oder welche Serie ist eigentlich überbewertet?' },
  { id: 'ht-l-02', category: 'hotTakes', depth: 'leicht', text: 'Welcher Trend nervt dich aktuell am meisten?' },
  { id: 'ht-l-03', category: 'hotTakes', depth: 'leicht', text: 'Welches Essen wird unverdient gefeiert?' },
  { id: 'ht-l-04', category: 'hotTakes', depth: 'leicht', text: 'Was ist die nervigste Smalltalk-Frage?' },
  { id: 'ht-l-05', category: 'hotTakes', depth: 'leicht', text: 'Welche Marke ist überhyped?' },
  { id: 'ht-l-06', category: 'hotTakes', depth: 'leicht', text: 'Welche Tradition findest du eigentlich sinnlos?' },
  { id: 'ht-l-07', category: 'hotTakes', depth: 'leicht', text: 'Welcher Promi wird unverdient bewundert?' },
  { id: 'ht-l-08', category: 'hotTakes', depth: 'leicht', text: 'Welcher Urlaubsort ist überschätzt?' },
  { id: 'ht-l-09', category: 'hotTakes', depth: 'leicht', text: 'Welche Süßigkeit ist eigentlich eklig?' },
  { id: 'ht-l-10', category: 'hotTakes', depth: 'leicht', text: 'Welche Floskel solltest du nie wieder hören müssen?' },
  { id: 'ht-l-11', category: 'hotTakes', depth: 'leicht', text: 'Welche App ist reine Zeitverschwendung?' },
  { id: 'ht-l-12', category: 'hotTakes', depth: 'leicht', text: 'Welcher "harmlose" Moment kann dir den ganzen Tag verderben?' },
  { id: 'ht-l-13', category: 'hotTakes', depth: 'leicht', text: 'Welcher Musik-Genre hörst du absolut gar nicht?' },
  { id: 'ht-l-14', category: 'hotTakes', depth: 'leicht', text: 'Welcher Beruf wird massiv überschätzt?' },
  { id: 'ht-l-15', category: 'hotTakes', depth: 'leicht', text: 'Welche Veranstaltung würdest du sofort abschaffen?' },
  { id: 'ht-l-16', category: 'hotTakes', depth: 'leicht', text: 'Welche moderne Erfindung war ein Rückschritt?' },
  { id: 'ht-l-17', category: 'hotTakes', depth: 'leicht', text: 'Welche Tier-Liebe verstehst du absolut nicht?' },

  // 🟡 persoenlich
  { id: 'ht-p-01', category: 'hotTakes', depth: 'persoenlich', text: 'Welche Meinung würdest du nie öffentlich auf Social Media posten?' },
  { id: 'ht-p-02', category: 'hotTakes', depth: 'persoenlich', text: 'In welchem Bereich denkst du, dass die Mehrheit komplett falsch liegt?' },
  { id: 'ht-p-03', category: 'hotTakes', depth: 'persoenlich', text: 'Welche gesellschaftliche Norm findest du absurd?' },
  { id: 'ht-p-04', category: 'hotTakes', depth: 'persoenlich', text: 'Welche Verhaltensweise deiner Generation magst du nicht?' },
  { id: 'ht-p-05', category: 'hotTakes', depth: 'persoenlich', text: 'Welche Verhaltensweise einer anderen Generation findest du anstrengend?' },
  { id: 'ht-p-06', category: 'hotTakes', depth: 'persoenlich', text: 'Welche "wichtige" Sache findest du eigentlich unwichtig?' },
  { id: 'ht-p-07', category: 'hotTakes', depth: 'persoenlich', text: 'Worüber regen sich Leute auf, wo es dir komplett egal ist?' },
  { id: 'ht-p-08', category: 'hotTakes', depth: 'persoenlich', text: 'Bei welchem Thema hast du heimlich eine andere Meinung als deine Freunde?' },
  { id: 'ht-p-09', category: 'hotTakes', depth: 'persoenlich', text: 'Welche Eigenschaft an Menschen kannst du gar nicht ab?' },
  { id: 'ht-p-10', category: 'hotTakes', depth: 'persoenlich', text: 'Welche "Selbstoptimierung" findest du eigentlich peinlich?' },
  { id: 'ht-p-11', category: 'hotTakes', depth: 'persoenlich', text: 'Welchen Lifestyle-Trend hältst du für reine Show?' },
  { id: 'ht-p-12', category: 'hotTakes', depth: 'persoenlich', text: 'Was ist die schlimmste Höflichkeits-Lüge, die alle ständig sagen?' },
  { id: 'ht-p-13', category: 'hotTakes', depth: 'persoenlich', text: 'Welcher Trend ist dir so suspekt, dass du heimlich darüber lachst?' },
  { id: 'ht-p-14', category: 'hotTakes', depth: 'persoenlich', text: 'Welche allgegenwärtige Werbe-Botschaft hältst du für eine Lüge?' },
  { id: 'ht-p-15', category: 'hotTakes', depth: 'persoenlich', text: 'Wie unterscheidest du echte von Fake-Freundschaft?' },
  { id: 'ht-p-16', category: 'hotTakes', depth: 'persoenlich', text: 'Welcher Konsens in deinem Freundeskreis irritiert dich heimlich?' },
  { id: 'ht-p-17', category: 'hotTakes', depth: 'persoenlich', text: 'Welche Eigenschaft, auf die alle stolz sind, findest du überschätzt?' },

  // 🔴 intensiv
  { id: 'ht-i-01', category: 'hotTakes', depth: 'intensiv', text: 'Welche Meinung über jemanden in deinem Umfeld behältst du für dich?' },
  { id: 'ht-i-02', category: 'hotTakes', depth: 'intensiv', text: 'Welchen Glaubenssatz deiner Familie hast du im Stillen abgelegt?' },
  { id: 'ht-i-03', category: 'hotTakes', depth: 'intensiv', text: 'Was findest du an deinem besten Freund eigentlich problematisch?' },
  { id: 'ht-i-04', category: 'hotTakes', depth: 'intensiv', text: 'Was ist eine Wahrheit, die niemand in deinem Umfeld hören will?' },
  { id: 'ht-i-05', category: 'hotTakes', depth: 'intensiv', text: 'Welche Lebensentscheidung deiner Freunde findest du fragwürdig?' },
  { id: 'ht-i-06', category: 'hotTakes', depth: 'intensiv', text: 'In welchem Punkt denkst du anders als deine Eltern, ohne es ihnen zu sagen?' },
  { id: 'ht-i-07', category: 'hotTakes', depth: 'intensiv', text: 'Welcher Mensch verdient eigentlich nicht den Platz, den er in deinem Leben hat?' },
  { id: 'ht-i-08', category: 'hotTakes', depth: 'intensiv', text: 'Welches Tabu hältst du eigentlich für überbewertet?' },
  { id: 'ht-i-09', category: 'hotTakes', depth: 'intensiv', text: 'Welche moralische Linie hast du selbst überschritten?' },
  { id: 'ht-i-10', category: 'hotTakes', depth: 'intensiv', text: 'Was ist eine ehrliche Meinung über dich selbst, die unangenehm ist?' },
  { id: 'ht-i-11', category: 'hotTakes', depth: 'intensiv', text: 'Welche kollektive Empörung verstehst du nicht?' },
  { id: 'ht-i-12', category: 'hotTakes', depth: 'intensiv', text: 'Wann hast du zuletzt richtig schlecht über jemanden geredet, und warum?' },
  { id: 'ht-i-13', category: 'hotTakes', depth: 'intensiv', text: 'Welche Person würdest du aus deinem Leben streichen, wenn es konsequenzlos wäre?' },
  { id: 'ht-i-14', category: 'hotTakes', depth: 'intensiv', text: 'Welcher gesellschaftliche Konsens basiert deiner Meinung nach auf einer Illusion?' },
  { id: 'ht-i-15', category: 'hotTakes', depth: 'intensiv', text: 'Welche unbequeme Wahrheit über deine Beziehung / dein Singledasein gibt es?' },
  { id: 'ht-i-16', category: 'hotTakes', depth: 'intensiv', text: 'Wo bist du moralisch nicht so integer, wie alle denken?' },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  lustig: 'Lustig & Albern',
  deepTalk: 'Deep Talk',
  hotTakes: 'Hot Takes',
};

export const DEPTH_LABELS: Record<Depth, { label: string; emoji: string }> = {
  leicht: { label: 'Leicht', emoji: '🟢' },
  persoenlich: { label: 'Persönlich', emoji: '🟡' },
  intensiv: { label: 'Intensiv', emoji: '🔴' },
};

export function pickQuestion(
  categories: Category[],
  depths: Depth[],
  excludeIds: string[] = []
): Question | null {
  const pool = QUESTIONS.filter(
    (q) =>
      categories.includes(q.category) &&
      depths.includes(q.depth) &&
      !excludeIds.includes(q.id)
  );
  if (pool.length === 0) {
    // Fallback: ohne Exclude, falls Pool leer (alle gespielt)
    const fullPool = QUESTIONS.filter(
      (q) => categories.includes(q.category) && depths.includes(q.depth)
    );
    if (fullPool.length === 0) return null;
    return fullPool[Math.floor(Math.random() * fullPool.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
