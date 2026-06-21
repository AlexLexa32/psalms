const DATA = window.PSALTER_APP_DATA;

const STORAGE_KEYS = {
  translation: "psalter.translation.v2",
  kathisma: "psalter.kathisma",
  prayerVersion: "psalter.prayerVersion.v2",
  fontScale: "psalter.fontScale.v1"
};

const MOSCOW_TIMEZONE = "Europe/Moscow";
const PSALM_HEADING_START_MARKERS = [
  "в конец",
  "псалом",
  "песнь",
  "молитва",
  "разум",
  "аллилу",
  "о наследствующем",
  "о точилех",
  "о точилах",
  "о осмом",
  "о тайных",
  "о заступлении",
  "в воспоминание",
  "идифуму",
  "сынов кореевых",
  "сынов кореовых",
  "асафу",
  "еману",
  "ефаму",
  "моисея",
  "соломону",
  "начальнику хора",
  "плачевная песнь",
  "при обновлении",
  "раба господня"
];
const PSALM_HEADING_CONTINUATIONS = ["егда", "внегда", "яже", "еже", "жене", "сына", "при", "когда", "после", "о "];
const SYNODAL_HEADING_MARKERS = [
  "[",
  "псалом",
  "песнь восхождения",
  "начальнику хора",
  "учение",
  "молитва",
  "хвала",
  "аллилу",
  "давида",
  "соломона",
  "асафа",
  "сынов кореевых",
  "сынов кореовых",
  "аггея",
  "захарии",
  "иеремии",
  "иезекииля",
  "моисея"
];
const SYNODAL_COMMENTARY_MARKERS = [
  "содержание псалма",
  "псалом представляет",
  "псалмопевец",
  "пораженный",
  "при возвращении",
  "жизнь в единении",
  "надеющийся",
  "ходящий",
  "много теснили",
  "если бы не господь",
  "без бога",
  "господи, ты знаешь",
  "во время бедствий",
  "когда я взывал",
  "я постоянно обращаюсь",
  "я возрадовался",
  "только к тебе",
  "при реках вавилона"
];

const state = {
  translation: "churchSlavonic",
  kathismaId: 1,
  prayerVersion: "full",
  fontScale: 1,
  selectedText: ""
};

const translationToggle = document.getElementById("translation-toggle");
const prayerVersionToggle = document.getElementById("prayer-version-toggle");
const kathismaSelect = document.getElementById("kathisma-select");
const kathismaGrid = document.getElementById("kathisma-grid");
const summaryView = document.getElementById("today-summary");
const readingView = document.getElementById("reading-view");
const readingNav = document.getElementById("reading-nav");
const fontDecreaseButton = document.getElementById("font-decrease-button");
const fontIncreaseButton = document.getElementById("font-increase-button");
const fontResetButton = document.getElementById("font-reset-button");
const fontSizeValue = document.getElementById("font-size-value");
const copySelectionButton = document.getElementById("copy-selection-button");
const selectionStatus = document.getElementById("selection-status");

const PRAYER_VERSION_OPTIONS = [
  {
    id: "short",
    label: "Краткая"
  },
  {
    id: "full",
    label: "Полная"
  }
];
const TRANSLATION_OPTIONS = [
  {
    id: "churchSlavonic",
    label: "Церковнославянский",
    description: "Церковнославянский текст, показанный удобным гражданским шрифтом."
  },
  {
    id: "synodal",
    label: "Синодальный",
    description: "Современный синодальный текст с привычной русской подачей."
  },
  {
    id: "parallel",
    label: "Параллельно",
    description: "ЦСЯ и синодальный перевод рядом, в двух столбцах."
  }
];
const FONT_SCALE_MIN = 0.85;
const FONT_SCALE_MAX = 1.35;
const FONT_SCALE_STEP = 0.05;

const FULL_GOSPEL_PRAYER = {
  churchSlavonic:
    "Возсия́й в сердца́х на́ших, Человеколю́бче Го́споди, Твоего́ богове́дения нетле́нный све́т, и мы́сленная на́ша отве́рзи о́чи во ева́нгельских Твои́х пропове́даний разуме́ние, вложи́ в на́с и блаже́нных Твои́х за́поведей стра́х, да плотски́я по́хоти вся́ попра́вше, духо́вное жи́тельство про́йдем, вся́ я́же ко благоугожде́нию Твоему́ и му́дрствующе и де́юще. Ты́ бо еси́ просвеще́ние ду́ш и теле́с на́ших, Христе́ Бо́же, и Тебе́ сла́ву возсыла́ем, со Безнача́льным Твои́м Отце́м и Всесвяты́м, и Благи́м, и Животворя́щим Твои́м Ду́хом, ны́не и при́сно, и во ве́ки веко́в, ами́нь.",
  synodal:
    "Зажги в сердцах наших, человеколюбивый Господи, Твоего Богопознания нетленный свет и открой очи ума нашего для уразумения евангельской Твоей проповеди! Вложи в нас и страх пред блаженными Твоими заповедями, дабы мы, все плотские влечения поправ, проводили духовную жизнь, о всём, что ко благоугождению Тебе, мысля и то совершая. Ибо Ты – просвещение душ и тел наших, Христе Боже, и Тебе славу возсылаем, со Безначальным Твоим Отцом и Всесвятым, и Благим, и Животворящим Твоим Духом ныне, и всегда, и во веки веков. Аминь."
};

const SHORT_GOSPEL_PRAYER =
  "Го́споди Иису́се Христе́! Отве́рзи мои́ о́чи серде́чные, что́бы услышать мне́ сло́во Твое́ и уразуметь его́ и исполнить во́лю Твою́.";

const GOSPEL_AFTER_PRAYER =
  "Спаси, Господи и помилуй рабов Твоих (имена) словами Божественного Евангелия, читаемыми во спасение. Попали, Господи, терние всех наших согрешений, и да вселится в нас благодать Твоя очищающая, освящающая всего человека, во имя Отца и Сына и Святого Духа. Аминь.";

const SHORT_BEFORE_KATHISMA_ENDING = [
  "Го́споди, поми́луй. (12 раз.)",
  "Слава Отцу, и Сыну, и Святому Духу, и ныне, и присно, и во веки веков. Аминь."
];
const SYNODAL_HEADING_REPAIRS = {
  88: "Учение Ефама Езрахита.",
  119: "Песнь восхождения.",
  120: "Песнь восхождения.",
  121: "Песнь восхождения. Давида.",
  122: "Песнь восхождения.",
  123: "Песнь восхождения. Давида.",
  124: "Песнь восхождения.",
  125: "Песнь восхождения.",
  126: "Песнь восхождения. Соломона.",
  127: "Песнь восхождения.",
  128: "Песнь восхождения.",
  129: "Песнь восхождения.",
  130: "Песнь восхождения. Давида.",
  131: "Песнь восхождения.",
  132: "Песнь восхождения. Давида.",
  133: "Песнь восхождения.",
  138: "Начальнику хора. Псалом Давида.",
  139: "Начальнику хора. Псалом Давида.",
  140: "Псалом Давида.",
  141: "Учение Давида. Молитва его, когда он был в пещере.",
  142: "Псалом Давида, [когда он преследуем был сыном своим Авессаломом]."
};
const WEEKDAY_HYMNS = {
  0: {
    title: "Воскресные песнопения"
  },
  1: {
    title: "Песнопения понедельника",
    sections: [
      {
        label: "Небесным чинам бесплотным",
        troparion: {
          churchSlavonic:
            "Небе́сных во́инств Архистрати́зи,/ мо́лим вас при́сно мы недосто́йнии,/ да ва́шими моли́твами оградите́ нас/ кро́вом крил невеще́ственныя ва́шея сла́вы,/ сохраня́юще нас припа́дающия приле́жно и вопию́щия:/ от бед изба́вите нас,// я́ко чинонача́льницы вы́шних Сил.",
          synodal:
            "Небесных воинств Архистратиги, непрестанно молим вас мы, недостойные, чтобы вы оградили нас вашими молитвами под кровом крыл невещественной вашей славы, сохраняя нас, припадающих усердно и взывающих: «От бед избавьте нас, как начальники Вышних Сил!»"
        },
        kontakion: {
          churchSlavonic:
            "Архистрати́зи Бо́жии,/ служи́телие Боже́ственныя сла́вы,/ А́нгелов нача́льницы, и челове́ков наста́вницы,/ поле́зное нам проси́те, и ве́лию ми́лость,// я́ко Безпло́тных Архистрати́зи.",
          synodal:
            "Архистратиги Божии, служители Божественной Славы, Ангелов начальники и людей наставники, полезное нам испросите и великую милость, как бесплотных Архистратиги."
        }
      }
    ]
  },
  2: {
    title: "Песнопения вторника",
    sections: [
      {
        label: "Святому Иоанну Предтече",
        troparion: {
          churchSlavonic:
            "Па́мять пра́веднаго с похвала́ми,/ тебе́ же довле́ет свиде́тельство Госпо́дне, Предте́че:/ показа́л бо ся еси́ вои́стину и проро́ков честне́йший,/ я́ко и в струя́х крести́ти сподо́бился еси́ Пропове́даннаго./ Те́мже за и́стину пострада́в ра́дуяся,/ благовести́л еси́ и су́щим во а́де Бо́га я́вльшагося пло́тию,/ взе́млющаго грех ми́ра,// и подаю́щаго нам ве́лию ми́лость.",
          synodal:
            "Память праведника чтится похвалами, тебе же довольно свидетельства Господня, Предтеча, ведь явился ты поистине из пророков славнейшим, ибо удостоился в струях крестить Проповеданного. Потому за истину пострадав с радостью, благовествовал ты и находящимся во аде Бога, явившегося во плоти, подъемлющего грех мира и подающего нам великую милость."
        },
        kontakion: {
          churchSlavonic:
            "Проро́че Бо́жий и Предте́че благода́ти,/ главу́ твою́ я́ко ши́пок свяще́ннейший от земли́ обре́тше,/ исцеле́ния всегда́ прие́млем,// и́бо па́ки, я́коже пре́жде, в ми́ре пропове́дуеши покая́ние.",
          synodal:
            "Пророк Божий и Предтеча благодати, главу твою как священнейшую розу в земле обретя, мы всегда получаем исцеления, ибо снова, как и прежде, ты возвещаешь в мире о покаянии."
        }
      }
    ]
  },
  3: {
    title: "Песнопения среды",
    sections: [
      {
        label: "Святому Кресту",
        troparion: {
          churchSlavonic:
            "Спаси́, Го́споди, лю́ди Твоя́/ и благослови́ достоя́ние Твое́,/ побе́ды на сопроти́вныя да́руя// и Твое́ сохраня́я Кресто́м Твои́м жи́тельство.",
          synodal:
            "Спаси, Господи, людей Твоих и благослови все, что принадлежит Тебе. Даруй победы над врагами и сохрани силою Креста Твоего тех, среди которых пребываешь Ты."
        },
        kontakion: {
          churchSlavonic:
            "Вознесы́йся на Крест во́лею,/ тезоимени́тому Твоему́ но́вому жи́тельству,/ щедро́ты Твоя́ да́руй, Христе́ Бо́же,/ возвесели́ нас си́лою Твое́ю,/ побе́ды дая́ нам на сопоста́ты,/ посо́бие иму́щим Твое́ ору́жие ми́ра,// непобеди́мую побе́ду.",
          synodal:
            "Вознесенный на Крест добровольно, соименному Тебе новому народу милости Твои даруй, Христе Боже; возвесели силою Твоею верных людей Твоих, подавая им победы над врагами, да имеют они помощь от Тебя, оружие мира, непобедимый знак победы."
        }
      }
    ]
  },
  4: {
    title: "Песнопения четверга",
    sections: [
      {
        label: "Святым апостолам",
        troparion: {
          churchSlavonic: "Апо́столи святи́и,/ моли́те Ми́лостиваго Бо́га,/ да прегреше́ний оставле́ние// пода́ст душа́м на́шим.",
          synodal: "Апостолы святые, молите Милостивого Бога, да прегрешений прощение подаст душам нашим."
        },
        kontakion: {
          churchSlavonic:
            "Тве́рдыя и боговеща́нныя пропове́датели,/ верх апо́столов Твои́х, Го́споди,/ прия́л еси́ в наслажде́ние благи́х Твои́х и поко́й;/ боле́зни бо о́нех и смерть прия́л еси́ па́че вся́каго всепло́дия,// Еди́не све́дый серде́чная.",
          synodal:
            "Непоколебимых и богогласных проповедников, высших из учеников Твоих, Господи, Ты принял в наслаждение благ Твоих и покой; ибо труды их и смерть признал Ты высшими всякой жертвы, Один, знающий то, что в сердцах."
        }
      },
      {
        label: "Святителю Николаю",
        troparion: {
          churchSlavonic:
            "Пра́вило ве́ры и о́браз кро́тости,/ воздержа́ния учи́теля/ яви́ тя ста́ду твоему́/ Я́же веще́й И́стина./ Сего́ ра́ди стяжа́л еси́ смире́нием высо́кая,/ нището́ю бога́тая,/ о́тче священнонача́льниче Нико́лае,/ моли́ Христа́ Бо́га,// спасти́ся душа́м на́шим.",
          synodal:
            "Правилом веры и образом кротости, воздержания учителем явила тебя стаду твоему непреложная Истина. Потому ты приобрел смирением высокое, нищетою богатство. Отче, святитель Николай, моли Христа Бога о спасении душ наших."
        },
        kontakion: {
          churchSlavonic:
            "В Ми́рех, свя́те, священноде́йствитель показа́лся еси́,/ Христо́во бо, преподо́бне, Ева́нгелие испо́лнив,/ положи́л еси́ ду́шу твою́ о лю́дех твои́х/ и спасл еси́ непови́нныя от сме́рти./ Сего́ ра́ди освяти́лся еси́,// я́ко вели́кий таи́нник Бо́жия благода́ти.",
          synodal:
            "В Мирах ты, святой, явился совершителем священнодействий, ибо Христово Евангелие исполнив, положил ты, преподобный, душу свою за людей твоих и неповинных спас от смерти; потому был ты освящен как великий служитель таинств Божией благодати."
        }
      }
    ]
  },
  5: {
    title: "Песнопения пятницы",
    sections: [
      {
        label: "Святому Кресту",
        troparion: {
          churchSlavonic:
            "Спаси́, Го́споди, лю́ди Твоя́/ и благослови́ достоя́ние Твое́,/ побе́ды на сопроти́вныя да́руя// и Твое́ сохраня́я Кресто́м Твои́м жи́тельство.",
          synodal:
            "Спаси, Господи, людей Твоих и благослови все, что принадлежит Тебе. Даруй победы над врагами и сохрани силою Креста Твоего тех, среди которых пребываешь Ты."
        },
        kontakion: {
          churchSlavonic:
            "Вознесы́йся на Крест во́лею,/ тезоимени́тому Твоему́ но́вому жи́тельству,/ щедро́ты Твоя́ да́руй, Христе́ Бо́же,/ возвесели́ нас си́лою Твое́ю,/ побе́ды дая́ нам на сопоста́ты,/ посо́бие иму́щим Твое́ ору́жие ми́ра,// непобеди́мую побе́ду.",
          synodal:
            "Вознесенный на Крест добровольно, соименному Тебе новому народу милости Твои даруй, Христе Боже; возвесели силою Твоею верных людей Твоих, подавая им победы над врагами, да имеют они помощь от Тебя, оружие мира, непобедимый знак победы."
        }
      }
    ]
  },
  6: {
    title: "Песнопения субботы",
    sections: [
      {
        label: "Всем святым",
        troparion: {
          churchSlavonic:
            "Апо́столи, му́ченицы и проро́цы,/ святи́телие, преподо́бнии и пра́веднии,/ до́бре по́двиг соверши́вшии и ве́ру соблю́дшии,/ дерзнове́ние иму́ще ко Спа́су,/ о нас Того́, я́ко Бла́га, моли́те// спасти́ся, мо́лимся, душа́м на́шим.",
          synodal:
            "Апостолы, мученики и пророки, святители, преподобные и праведные, подвиг доблестно совершившие и веру сохранившие, дерзновение пред Спасителем имея, Его за нас, как благого, умолите, молимся, во спасение душам нашим."
        },
        kontakion: {
          churchSlavonic:
            "Я́ко нача́тки естества́, Насади́телю тва́ри,/ вселе́нная прино́сит Ти, Го́споди, богоно́сныя му́ченики;/ тех моли́твами в ми́ре глубо́це// Це́рковь Твою́, жи́тельство Твое́ Богоро́дицею соблюди́, Многоми́лостиве.",
          synodal:
            "Как первые плоды природы Насадителю всего творения вселенная приносит Тебе, Господи, богоносных мучеников. Их мольбами и ходатайством Богородицы, Церковь Твою, Твой народ в мире глубоком сохрани, Многомилостивый."
        }
      },
      {
        label: "За усопших",
        troparion: {
          churchSlavonic:
            "Помяни́, Го́споди, я́ко Благ, рабы́ Твоя́,/ и, ели́ка в житии́ согреши́ша, прости́:/ никто́же бо безгре́шен, то́кмо Ты,// моги́й и преста́вленным да́ти поко́й.",
          synodal:
            "Помяни, Господи, как Благой, рабов Твоих и всё, в чем они в жизни согрешили, прости; ибо никто не безгрешен, кроме Тебя. Ты можешь и преставившимся дать покой."
        },
        kontakion: {
          churchSlavonic:
            "Со святы́ми упоко́й,/ Христе́,/ ду́ши раб Твои́х,/ иде́же несть боле́знь, ни печа́ль,/ ни воздыха́ние,// но жизнь безконе́чная.",
          synodal:
            "Со святыми упокой, Христе, души рабов Твоих, там, где нет ни боли, ни скорби, ни стенания, но жизнь бесконечная."
        }
      }
    ]
  }
};
const SUNDAY_HYMNS_BY_TONE = {
  1: {
    troparion: {
      churchSlavonic:
        "Ка́мени запеча́тану от иуде́й/ и во́ином стрегу́щим Пречи́стое Те́ло Твое́,/ воскре́сл еси́ тридне́вный, Спа́се,/ да́руяй ми́рови жи́знь./ Сего́ ра́ди си́лы небе́сныя вопия́ху Ти́, Жизнода́вче:/ сла́ва воскресе́нию Твоему́, Христе́,/ сла́ва Ца́рствию Твоему́,// сла́ва смотре́нию Твоему́, еди́не Человеколю́бче.",
      synodal:
        "Хотя камень был опечатан иудеями, и воины стерегли пречистое тело Твое, воскрес Ты в третий день, Спаситель, даруя миру жизнь. Потому силы небесные взывали к Тебе, Податель жизни: слава воскресению Твоему, Христе, слава Царству Твоему, слава промыслу Твоему, Единый Человеколюбец."
    },
    kontakion: {
      churchSlavonic:
        "Воскре́сл еси́ я́ко Бо́г из гро́ба во сла́ве,/ и ми́р совоскреси́л еси́;/ и естество́ челове́ческое я́ко Бо́га воспева́ет Тя́, и сме́рть исчезе́;/ Ада́м же лику́ет, Влады́ко;/ Е́ва ны́не от у́з избавля́ема ра́дуется, зову́щи:// Ты́ еси́, И́же все́м подая́, Христе́, воскресе́ние.",
      synodal:
        "Воскрес Ты, как Бог, из гроба во славе и мир с Собою воскресил. И естество человеческое как Бога воспело Тебя, и исчезла смерть. Адам торжествует, Владыка, и Ева ныне, от уз избавляемая, радуется, взывая: Ты, Христе, всем даруешь воскресение."
    }
  },
  2: {
    troparion: {
      churchSlavonic:
        "Егда́ снизше́л еси́ к сме́рти, Животе́ Безсме́ртный,/ тогда́ а́д умертви́л еси́ блиста́нием Божества́:/ егда́ же и уме́ршия от преиспо́дних воскреси́л еси́,/ вся́ си́лы небе́сныя взыва́ху:// Жизнода́вче, Христе́ Бо́же на́ш, сла́ва Тебе́.",
      synodal:
        "Когда сошел Ты к смерти, Жизнь бессмертная, тогда ад умертвил Ты сиянием Божества. Когда же Ты и умерших из преисподней воскресил, все силы небесные взывали: Податель жизни, Христе Боже наш, слава Тебе."
    },
    kontakion: {
      churchSlavonic:
        "Воскре́сл еси́ от гро́ба, Всеси́льне Спа́се,/ и а́д ви́дев чу́до, ужасе́ся,/ и ме́ртвии воста́ша;/ тва́рь же ви́дящи сра́дуется Тебе́,/ и Ада́м свесели́тся,// и ми́р, Спа́се мо́й, воспева́ет Тя́ при́сно.",
      synodal:
        "Воскрес Ты из гроба, всесильный Спаситель, и ад, увидев это чудо, ужасался, и мертвые восставали. И всё творение, видя это, радуется с Тобой, и Адам веселится, и мир Тебя, Спаситель мой, прославляет непрестанно."
    }
  },
  3: {
    troparion: {
      churchSlavonic:
        "Да веселя́тся небе́сная,/ да ра́дуются земна́я,/ я́ко сотвори́ держа́ву/ мы́шцею Свое́ю Госпо́дь,/ попра́ сме́ртию сме́рть,/ пе́рвенец ме́ртвых бы́сть;/ из чре́ва а́дова изба́ви на́с,// и подаде́ ми́рови ве́лию ми́лость.",
      synodal:
        "Да веселится всё небесное, да радуется всё земное, ибо явил могущество руки Своей Господь: попрал смертию смерть, сделался первенцем из мертвых, из чрева ада избавил нас и даровал миру великую милость."
    },
    kontakion: {
      churchSlavonic:
        "Воскре́сл еси́ дне́сь из гро́ба, Ще́дре,/ и на́с возве́л еси́ от вра́т сме́ртных;/ дне́сь Ада́м лику́ет, и ра́дуется Е́ва,/ вку́пе же и проро́цы с патриа́рхи воспева́ют непреста́нно// Боже́ственную держа́ву вла́сти Твоея́.",
      synodal:
        "Воскрес Ты в сей день из гроба, Милосердный, и вывел нас из врат смерти. В сей день Адам ликует и радуется Ева, а вместе с ними и пророки с патриархами воспевают непрестанно божественную мощь власти Твоей."
    }
  },
  4: {
    troparion: {
      churchSlavonic:
        "Све́тлую воскресе́ния про́поведь/ от А́нгела уве́девша Госпо́дни учени́цы/ и пра́деднее осужде́ние отве́ргша,/ апо́столом хва́лящася глаго́лаху:/ испрове́ржеся сме́рть,/ воскре́се Христо́с Бо́г,// да́руяй ми́рови ве́лию ми́лость.",
      synodal:
        "Радостную весть о воскресении узнав от Ангела и избавившись от прародительского осуждения, Господни ученицы апостолам возвещали, торжествуя: низвержена смерть, воскрес Христос Бог, дарующий миру великую милость."
    },
    kontakion: {
      churchSlavonic:
        "Спа́с и Изба́витель мо́й/ из гро́ба, я́ко Бо́г,/ воскреси́ от у́з земноро́дныя,/ и врата́ а́дова сокруши́,// и я́ко Влады́ка воскре́се тридне́вен.",
      synodal:
        "Спаситель и Избавитель мой от гроба, как Бог, воскресил из оков земнородных и врата ада сокрушил, и как Владыка воскрес на третий день."
    }
  },
  5: {
    troparion: {
      churchSlavonic:
        "Собезнача́льное Сло́во Отцу́ и Ду́хови,/ от Де́вы ро́ждшееся на спасе́ние на́ше,/ воспои́м, ве́рнии, и поклони́мся,/ я́ко благоволи́ пло́тию взы́ти на кре́ст,/ и сме́рть претерпе́ти,/ и воскреси́ти уме́ршия// сла́вным воскресе́нием Свои́м.",
      synodal:
        "Слово, безначальное подобно Отцу и Духу, от Девы родившееся для спасения нашего, воспоем, верные, и поклонимся Ему, ибо благоволил Он плотию взойти на Крест, и смерть претерпеть, и воскресить умерших славным воскресением Своим."
    },
    kontakion: {
      churchSlavonic:
        "Ко а́ду, Спа́се мо́й, соше́л еси́,/ и врата́ сокруши́вый я́ко Всеси́лен,/ уме́рших я́ко Созда́тель совоскреси́л еси́,/ и сме́рти жа́ло сокруши́л еси́,/ и Ада́м от кля́твы изба́влен бы́сть,/ Человеколю́бче, те́мже вси́ зове́м:// спаси́ на́с, Го́споди.",
      synodal:
        "Во ад сошел Ты, Спаситель мой, и врата его сокрушив, как Всемогущий, как Творец умерших воскресил с Собою, и жало смерти уничтожил, и Адама от проклятия избавил, Человеколюбец. Потому все мы восклицаем Тебе: спаси нас, Господи."
    }
  },
  6: {
    troparion: {
      churchSlavonic:
        "А́нгельския си́лы на гро́бе Твое́м,/ и стрегу́щии омертве́ша,/ и стоя́ше Мари́я во гро́бе,/ и́щущи Пречи́стаго Те́ла Твоего́./ Плени́л еси́ а́д, не искуси́вся от него́;/ сре́тил еси́ Де́ву, Да́руяй живо́т.// Воскресы́й из ме́ртвых, Го́споди, сла́ва Тебе́.",
      synodal:
        "Ангельские силы при гробе Твоем, и охранявшие его омертвели, а Мария стояла у гробницы и искала пречистое тело Твое. Ты опустошил ад, не потерпев от него, Ты встретил Деву, Дарующий жизнь. Воскресший из мертвых, Господи, слава Тебе."
    },
    kontakion: {
      churchSlavonic:
        "Живонача́льною дла́нию/ уме́ршия от мра́чных удо́лий,/ Жизнода́вец, воскреси́в все́х Христо́с Бо́г,/ воскресе́ние подаде́ челове́ческому ро́ду:/ е́сть бо все́х Спаси́тель,// Воскресе́ние и Живо́т, и Бо́г все́х.",
      synodal:
        "Живоначальною Своею дланию из мрачных глубин всех умерших воскресив, Податель жизни Христос Бог, воскресение даровал человеческой природе, ибо Он Спаситель всех, Воскресение и Жизнь и Бог всех."
    }
  },
  7: {
    troparion: {
      churchSlavonic:
        "Разруши́л еси́ Кресто́м Твои́м сме́рть,/ отве́рзл еси́ разбо́йнику ра́й,/ мироно́сицам пла́ч преложи́л еси́,/ и апо́столом пропове́дати повеле́л еси́,/ я́ко воскре́сл еси́, Христе́ Бо́же,/ да́руяй ми́рови// ве́лию ми́лость.",
      synodal:
        "Сокрушил Ты Крестом Своим смерть, открыл разбойнику рай, плач мироносиц в радость изменил и Своим апостолам проповедовать повелел, что Ты воскрес, Христе Боже, даруя миру великую милость."
    },
    kontakion: {
      churchSlavonic:
        "Не ктому́ держа́ва сме́ртная/ возмо́жет держа́ти челове́ки:/ Христо́с бо сни́де, сокруша́я и разоря́я си́лы ея́;/ связу́емь быва́ет а́д,/ проро́цы согла́сно ра́дуются,/ предста́, глаго́люще, Спа́с су́щим в ве́ре:// изыди́те, ве́рнии, в воскресе́ние.",
      synodal:
        "Уже не сможет более удерживать людей власть смерти, ибо сошел Христос, сокрушая и разоряя силы ее. Ад связан, пророки согласно радуются: явился, говорят, Спаситель тем, кто в вере; выходите, верные, для воскресения."
    }
  },
  8: {
    troparion: {
      churchSlavonic:
        "С высоты́ снизше́л еси́, Благоутро́бне,/ погребе́ние прия́л еси́ тридне́вное,/ да на́с свободи́ши страсте́й,// Животе́ и воскресе́ние на́ше. Го́споди, сла́ва Тебе́.",
      synodal:
        "С высоты сошел Ты, Милосердный, благоволил пребывать три дня во гробе, чтобы нас освободить от страстей, жизнь и воскресение наше, Господи, слава Тебе."
    },
    kontakion: {
      churchSlavonic:
        "Воскре́с из гро́ба, уме́ршия воздви́гл еси́,/ и Ада́ма воскреси́л еси́,/ и Е́ва лику́ет во Твое́м воскресе́нии,/ и мирсти́и концы́ торжеству́ют// е́же из ме́ртвых воста́нием Твои́м, Многоми́лостиве.",
      synodal:
        "Воскрес из гроба, умерших воздвиг Ты, и Адама воскресил, и Ева ликует о Твоем воскресении, и пределы мира торжествуют о восстании Твоем из мертвых, Многомилостивый."
    }
  }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createElement(tagName, className, textContent) {
  const node = document.createElement(tagName);

  if (className) {
    node.className = className;
  }

  if (typeof textContent === "string") {
    node.textContent = textContent;
  }

  return node;
}

function isParallelTranslation() {
  return state.translation === "parallel";
}

function getTranslationOption(translationId) {
  return TRANSLATION_OPTIONS.find((option) => option.id === translationId) ?? TRANSLATION_OPTIONS[0];
}

function getTranslationLabel(translationId = state.translation) {
  return getTranslationOption(translationId).label;
}

function clampFontScale(value) {
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, value));
}

function formatFontScale() {
  return `${Math.round(state.fontScale * 100)}%`;
}

function applyFontScale() {
  document.documentElement.style.setProperty("--reader-scale", String(state.fontScale));
}

function updateFontControls() {
  if (fontSizeValue) {
    fontSizeValue.textContent = formatFontScale();
  }

  if (fontDecreaseButton) {
    fontDecreaseButton.disabled = state.fontScale <= FONT_SCALE_MIN;
  }

  if (fontIncreaseButton) {
    fontIncreaseButton.disabled = state.fontScale >= FONT_SCALE_MAX;
  }
}

function setFontScale(nextScale) {
  state.fontScale = clampFontScale(Number(nextScale.toFixed(2)));
  localStorage.setItem(STORAGE_KEYS.fontScale, String(state.fontScale));
  applyFontScale();
  updateFontControls();
}

function getSelectedReadingText() {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return "";
  }

  const anchorNode = selection.anchorNode;
  const focusNode = selection.focusNode;

  if (!anchorNode || !focusNode || !readingView.contains(anchorNode) || !readingView.contains(focusNode)) {
    return "";
  }

  return selection
    .toString()
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function updateSelectionState(message = "") {
  state.selectedText = getSelectedReadingText();

  if (copySelectionButton) {
    copySelectionButton.disabled = !state.selectedText;
  }

  if (selectionStatus) {
    selectionStatus.textContent = message || (
      state.selectedText
        ? `Выделение готово к копированию: ${state.selectedText.length} символов.`
        : "Выдели нужный отрывок в тексте, затем нажми кнопку."
    );
  }
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "readonly");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

async function copySelectedText() {
  const text = getSelectedReadingText();

  if (!text) {
    updateSelectionState("Сначала выдели нужный отрывок.");
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopyText(text);
    }

    state.selectedText = text;
    updateSelectionState("Отрывок скопирован.");
  } catch (error) {
    updateSelectionState("Не получилось скопировать автоматически. Попробуй ещё раз после выделения.");
  }
}

function applyExternalNamesData() {
  const namesData = window.PSALTER_NAMES_DATA;

  if (!DATA?.prayers || !namesData) {
    return;
  }

  if (Array.isArray(namesData.livingNames)) {
    const readerNames = Array.isArray(namesData.readerNames) ? namesData.readerNames : [];
    DATA.prayers.livingPrayer.names = [...namesData.livingNames, ...readerNames];
  }

  if (Array.isArray(namesData.departedNames)) {
    DATA.prayers.departedPrayer.names = [...namesData.departedNames];
  }

  if (typeof namesData.livingLabel === "string" && namesData.livingLabel.trim()) {
    DATA.prayers.livingPrayer.namesLabel = namesData.livingLabel.trim();
  }

  if (typeof namesData.departedLabel === "string" && namesData.departedLabel.trim()) {
    DATA.prayers.departedPrayer.namesLabel = namesData.departedLabel.trim();
  }
}

function normalizeMatchingText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ѣ/gi, "е")
    .replace(/і/gi, "и")
    .replace(/ѳ/gi, "ф")
    .replace(/ѵ/gi, "и")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function looksLikePsalmHeadingStart(text) {
  const normalized = normalizeMatchingText(text);
  return PSALM_HEADING_START_MARKERS.some((marker) => normalized.startsWith(marker) || normalized.includes(` ${marker}`));
}

function looksLikePsalmHeadingContinuation(text) {
  const normalized = normalizeMatchingText(text);
  return PSALM_HEADING_CONTINUATIONS.some((marker) => normalized.startsWith(marker));
}

function looksLikeSynodalHeading(text) {
  const normalized = normalizeMatchingText(text);
  return SYNODAL_HEADING_MARKERS.some((marker) => normalized.startsWith(marker));
}

function looksLikeSynodalCommentary(text) {
  const cleaned = String(text).replace(/\s+/g, " ").trim();
  const normalized = normalizeMatchingText(cleaned);
  const numberedFragments = cleaned.match(/\b\d+\s+[А-Яа-яЁёA-Za-z]/gu) || [];

  if (/^\d+\s/u.test(cleaned) || numberedFragments.length >= 2) {
    return true;
  }

  if (/^\[[^\]]+\]\.?\s+\S/u.test(cleaned) && cleaned.length > 40) {
    return true;
  }

  if (!looksLikeSynodalHeading(cleaned) && cleaned.length > 40) {
    return true;
  }

  return SYNODAL_COMMENTARY_MARKERS.some((marker) => normalized.startsWith(marker));
}

function extractSynodalHeading(text) {
  const cleaned = String(text).replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return "";
  }

  if (!looksLikeSynodalCommentary(cleaned) && looksLikeSynodalHeading(cleaned)) {
    return cleaned;
  }

  const prefixMatch = cleaned.match(/^\[[^\]]+\]\.?/u);
  if (prefixMatch) {
    return prefixMatch[0].trim();
  }

  const chunks = cleaned.match(/\[[^\]]+\]\.?|[^.?!]+[.?!]?/gu) || [cleaned];
  let suffix = "";

  for (let index = chunks.length - 1; index >= 0; index -= 1) {
    suffix = `${chunks[index].trim()} ${suffix}`.trim();

    if (suffix.length > 120) {
      break;
    }

    if (looksLikeSynodalHeading(suffix) && !looksLikeSynodalCommentary(suffix)) {
      return suffix;
    }
  }

  return "";
}

function normalizePsalmHeading(psalm, translationId) {
  if (!psalm || !Array.isArray(psalm.verses) || psalm.verses.length === 0) {
    return;
  }

  const headingParts = [];

  if (psalm.heading) {
    headingParts.push(psalm.heading);
  }

  while (psalm.verses.length > 0) {
    const firstVerse = psalm.verses[0];

    if (headingParts.length === 0 && looksLikePsalmHeadingStart(firstVerse.text)) {
      headingParts.push(firstVerse.text);
      psalm.verses.shift();
      continue;
    }

    if (headingParts.length > 0 && looksLikePsalmHeadingContinuation(firstVerse.text)) {
      headingParts.push(firstVerse.text);
      psalm.verses.shift();
      continue;
    }

    break;
  }

  psalm.heading = headingParts.join(" ").trim();

  if (translationId === "synodal") {
    psalm.heading = extractSynodalHeading(psalm.heading);
  }
}

function prependPsalmVerse(psalm, verseNumber, text) {
  if (psalm.verses.some((verse) => verse.number === verseNumber)) {
    return;
  }

  psalm.verses.unshift({
    number: verseNumber,
    text
  });
}

function removePsalmVerse(psalm, verseNumber) {
  const index = psalm.verses.findIndex((verse) => verse.number === verseNumber);

  if (index >= 0) {
    psalm.verses.splice(index, 1);
  }
}

function stripLeadingNumberPrefix(text) {
  return String(text).replace(/^\d+\s+/u, "").trim();
}

function repairKnownPsalmData(psalm, translationId) {
  if (translationId === "churchSlavonic" && psalm.number === 4 && psalm.verses[0]?.number === 3) {
    prependPsalmVerse(
      psalm,
      2,
      "Внегда́ призва́ти ми, услы́ша мя Бог пра́вды моея́, в ско́рби распространи́л мя еси́, уще́дри мя и услы́ши моли́тву мою́."
    );
    psalm.heading = "В коне́ц, в пе́снех псало́м Дави́ду.";
  }

  if (translationId === "churchSlavonic" && psalm.number === 28 && psalm.verses[0]?.number === 3) {
    prependPsalmVerse(
      psalm,
      2,
      "Принеси́те Го́сподеви сы́нове Бо́жии, принеси́те Го́сподеви, сы́ны о́вни, принеси́те Го́сподеви сла́ву и честь. Принеси́те Го́сподеви сла́ву и́мени Его́, поклони́теся Го́сподеви во дворе́ святе́м Его́."
    );
    psalm.heading = "Псало́м Дави́ду, исхо́да ски́нии.";
  }

  if (translationId === "synodal" && psalm.number === 4 && psalm.verses[0]?.number === 3) {
    prependPsalmVerse(
      psalm,
      2,
      "Когда я взываю, услышь меня, Боже правды моей! В тесноте Ты давал мне простор. Помилуй меня и услышь молитву мою."
    );
    psalm.heading = "Начальнику хора. На струнных орудиях. Псалом Давида.";
  }

  if (translationId === "synodal" && SYNODAL_HEADING_REPAIRS[psalm.number]) {
    psalm.heading = SYNODAL_HEADING_REPAIRS[psalm.number];
  }

  if (translationId === "synodal" && psalm.number === 125 && psalm.verses[0]?.number === 2) {
    prependPsalmVerse(psalm, 1, "Когда возвращал Господь плен Сиона, мы были как бы видящие во сне:");
  }

  if (translationId === "synodal" && psalm.number === 88 && psalm.verses[0]?.text.includes("Учение Ефама Езрахита")) {
    removePsalmVerse(psalm, 1);
  }

  if (translationId === "synodal" && psalm.number === 139 && psalm.verses[0]?.text.startsWith("Начальнику хора. Псалом Давида")) {
    removePsalmVerse(psalm, 1);
  }

  if (translationId === "synodal" && psalm.number === 141) {
    for (const verse of psalm.verses) {
      verse.text = stripLeadingNumberPrefix(verse.text);
    }
  }
}

function normalizeLoadedData() {
  if (!DATA?.kathismas) {
    return;
  }

  for (const translationId of Object.keys(DATA.kathismas)) {
    for (const kathisma of DATA.kathismas[translationId]) {
      for (const segment of kathisma.segments) {
        for (const psalm of segment.psalms) {
          normalizePsalmHeading(psalm, translationId);
          repairKnownPsalmData(psalm, translationId);
        }
      }
    }
  }
}

function getDateStringForTimezone(timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatRussianDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function getUtcDateFromString(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function getOrthodoxPaschaDate(year) {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  const julianToGregorianOffset = Math.floor(year / 100) - Math.floor(year / 400) - 2;
  const date = new Date(Date.UTC(year, month - 1, day));

  date.setUTCDate(date.getUTCDate() + julianToGregorianOffset);
  return date;
}

function getSundayTone(dateString) {
  const date = getUtcDateFromString(dateString);

  if (date.getUTCDay() !== 0) {
    return null;
  }

  let referenceYear = date.getUTCFullYear();
  let thomasSunday = getOrthodoxPaschaDate(referenceYear);
  thomasSunday.setUTCDate(thomasSunday.getUTCDate() + 7);

  if (date < thomasSunday) {
    referenceYear -= 1;
    thomasSunday = getOrthodoxPaschaDate(referenceYear);
    thomasSunday.setUTCDate(thomasSunday.getUTCDate() + 7);
  }

  const diffWeeks = Math.floor((date - thomasSunday) / 604800000);
  return ((diffWeeks % 8) + 8) % 8 + 1;
}

function getWeekdayHymnText(textSet) {
  return state.translation === "synodal" ? textSet.synodal : textSet.churchSlavonic;
}

function getWeekdayHymnsForToday() {
  const dateString = getDateStringForTimezone(MOSCOW_TIMEZONE);
  const weekday = getUtcDateFromString(dateString).getUTCDay();
  const base = WEEKDAY_HYMNS[weekday];

  if (!base) {
    return null;
  }

  if (weekday === 0) {
    const tone = getSundayTone(dateString);
    const sundayHymns = SUNDAY_HYMNS_BY_TONE[tone];

    if (!sundayHymns) {
      return null;
    }

    return {
      title: "Тропари дня недели",
      lead: `Сегодня ${formatRussianDate(dateString)}. Ниже — воскресные тропарь и кондак ${tone}-го гласа.`,
      sections: [
        {
          label: `${tone}-й глас`,
          troparion: sundayHymns.troparion,
          kontakion: sundayHymns.kontakion
        }
      ]
    };
  }

  return {
    title: "Тропари дня недели",
    lead: `Сегодня ${formatRussianDate(dateString)}. Ниже — песнопения по дню недели.`,
    sections: base.sections
  };
}

function getTroparionData() {
  const dateString = getDateStringForTimezone(MOSCOW_TIMEZONE);
  const url = `https://azbyka.ru/days/${dateString}#tropari`;

  return {
    dateString,
    formattedDate: formatRussianDate(dateString),
    url
  };
}

function getMatthewZachaloForToday() {
  const gospel = DATA.gospelMatthew;

  if (!gospel?.zachala?.length) {
    return null;
  }

  const currentDateString = getDateStringForTimezone(MOSCOW_TIMEZONE);
  const startDate = new Date(`${gospel.cycleStartDate}T00:00:00Z`);
  const currentDate = new Date(`${currentDateString}T00:00:00Z`);
  const diffDays = Math.floor((currentDate - startDate) / 86400000);
  const startIndex = gospel.zachala.findIndex((item) => item.number === gospel.cycleStartZachalo);
  const safeStartIndex = startIndex >= 0 ? startIndex : 0;
  const cycleIndex = ((safeStartIndex + diffDays) % gospel.zachala.length + gospel.zachala.length) % gospel.zachala.length;

  return {
    ...gospel.zachala[cycleIndex],
    formattedDate: formatRussianDate(currentDateString)
  };
}

function getKathismaList() {
  return DATA.kathismas[DATA.translations[0].id];
}

function getKathismaData(translationId, kathismaId) {
  return DATA.kathismas[translationId][kathismaId - 1];
}

function buildTranslationToggle() {
  translationToggle.innerHTML = "";

  for (const translation of TRANSLATION_OPTIONS) {
    const button = createElement("button", "translation-button");
    button.type = "button";
    button.dataset.translation = translation.id;

    const title = createElement("strong", "", translation.label);
    const description = createElement("span", "", translation.description);

    button.append(title, description);

    if (translation.id === state.translation) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      state.translation = translation.id;
      localStorage.setItem(STORAGE_KEYS.translation, state.translation);
      render();
    });

    translationToggle.append(button);
  }
}

function buildPrayerVersionToggle() {
  prayerVersionToggle.innerHTML = "";

  for (const option of PRAYER_VERSION_OPTIONS) {
    const button = createElement("button", "translation-button");
    button.type = "button";
    button.dataset.prayerVersion = option.id;

    const title = createElement("strong", "", option.label);
    button.append(title);

    if (option.id === state.prayerVersion) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      state.prayerVersion = option.id;
      localStorage.setItem(STORAGE_KEYS.prayerVersion, state.prayerVersion);
      render();
    });

    prayerVersionToggle.append(button);
  }
}

function getCommonBeginningLines() {
  const beforeKathisma = DATA.prayers.beforeKathisma;
  const shortTroparion = beforeKathisma.shortTroparion.replace(/^Сла́ва Отцу́ и Сы́ну и Свято́му Ду́ху\.\s*/u, "");

  if (state.prayerVersion === "short") {
    return [
      ...DATA.prayers.commonBeginning.slice(0, 10),
      shortTroparion,
      ...SHORT_BEFORE_KATHISMA_ENDING,
      ...DATA.prayers.commonBeginning.slice(10)
    ];
  }

  return [
    ...DATA.prayers.commonBeginning.slice(0, 9),
    beforeKathisma.full.intro,
    ...beforeKathisma.full.troparia,
    beforeKathisma.full.lordHaveMercy,
    beforeKathisma.full.prayer,
    ...DATA.prayers.commonBeginning.slice(10)
  ];
}

function getAfterKathismaModeLabel() {
  return state.prayerVersion === "full" ? "Полная версия молитв" : "Краткая версия молитв";
}

function getFullAfterKathismaBlock(kathismaId) {
  return DATA.prayers.afterKathismaFull?.find((item) => item.kathismaId === kathismaId) ?? null;
}

function getGospelPreparationPrayer() {
  const gospelPrayers = DATA.prayers.gospelBeforeMatthew;

  if (state.prayerVersion === "short") {
    return gospelPrayers?.shortPrayer || SHORT_GOSPEL_PRAYER;
  }

  if (gospelPrayers?.fullPrayer) {
    return state.translation === "synodal" ? gospelPrayers.fullPrayer.synodal : gospelPrayers.fullPrayer.churchSlavonic;
  }

  return state.translation === "synodal" ? FULL_GOSPEL_PRAYER.synodal : FULL_GOSPEL_PRAYER.churchSlavonic;
}

function populateKathismaSelect() {
  kathismaSelect.innerHTML = "";

  for (const kathisma of getKathismaList()) {
    const option = document.createElement("option");
    option.value = String(kathisma.id);
    option.textContent = `${kathisma.id}-я кафизма`;
    kathismaSelect.append(option);
  }
}

function renderKathismaGrid() {
  kathismaGrid.innerHTML = "";

  for (const kathisma of getKathismaList()) {
    const button = createElement("button", "kathisma-chip", `${kathisma.id}`);
    button.type = "button";

    if (kathisma.id === state.kathismaId) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      state.kathismaId = kathisma.id;
      localStorage.setItem(STORAGE_KEYS.kathisma, String(state.kathismaId));
      render();
    });

    kathismaGrid.append(button);
  }
}

function renderSummary(kathismaNumber) {
  const translationLabel = getTranslationLabel();
  const prayerModeLabel = getAfterKathismaModeLabel();

  summaryView.innerHTML = `
    <div class="summary-grid">
      <div class="summary-line">
        <strong>${kathismaNumber}-я кафизма</strong>
        <span class="summary-date">${escapeHtml(translationLabel)}</span>
      </div>
      <div class="summary-kathisma">
        <span>Сейчас открыта</span>
        <strong>${kathismaNumber}-я кафизма</strong>
      </div>
      <p class="summary-meta">${escapeHtml(prayerModeLabel)}</p>
    </div>
  `;
}

function renderReadingNav() {
  const navItems = [
    { id: "common-beginning", label: "Начало" },
    { id: "segment-1", label: "Слава 1" },
    { id: "weekday-troparia", label: "Тропари недели" },
    { id: "segment-2", label: "Слава 2" },
    { id: "matthew-gospel", label: "Матфей" },
    { id: "segment-3", label: "Слава 3" },
    { id: "after-kathisma", label: "По окончании" },
    { id: "troparia-day", label: "Тропари дня" }
  ];

  readingNav.innerHTML = "";

  for (const item of navItems) {
    const link = document.createElement("a");
    link.href = `#${item.id}`;
    link.textContent = item.label;
    readingNav.append(link);
  }
}

function renderPrayerLines(lines) {
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function renderPrayerText(text) {
  if (Array.isArray(text)) {
    return text.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  }

  return `<p>${escapeHtml(text)}</p>`;
}

function renderNameCloud(names) {
  return names.map((name) => `<span class="name-pill">${escapeHtml(name)}</span>`).join("");
}

function renderPsalmInner(psalm, translationId) {
  const heading = psalm.heading ? `<div class="psalm-heading">${escapeHtml(psalm.heading)}</div>` : "";
  const subtitle = psalm.subtitle ? `<span class="psalm-subtitle">${escapeHtml(psalm.subtitle)}</span>` : "";
  const textClass = translationId === "churchSlavonic" ? "psalm-text church-slavonic" : "psalm-text";

  const verses = psalm.verses
    .map(
      (verse) => `
        <div class="verse">
          <div class="verse-number">${verse.number}</div>
          <div class="verse-text">${escapeHtml(verse.text)}</div>
        </div>
      `
    )
    .join("");

  return `
    <div class="psalm-title">
      <h4>${escapeHtml(psalm.title)}</h4>
      ${subtitle}
    </div>
    ${heading}
    <div class="${textClass}">${verses}</div>
  `;
}

function renderPsalmCard(psalm, translationId = state.translation) {
  return `
    <article class="psalm-card">
      ${renderPsalmInner(psalm, translationId)}
    </article>
  `;
}

function renderParallelPsalmCard(churchPsalm, synodalPsalm) {
  return `
    <article class="psalm-card parallel-psalm-card">
      <div class="parallel-psalm-grid">
        <section class="parallel-psalm-column">
          <div class="parallel-translation-label">ЦСЯ</div>
          ${renderPsalmInner(churchPsalm, "churchSlavonic")}
        </section>
        <section class="parallel-psalm-column">
          <div class="parallel-translation-label">Синодальный</div>
          ${renderPsalmInner(synodalPsalm, "synodal")}
        </section>
      </div>
    </article>
  `;
}

function renderPrayerCard(prayerType, segmentIndex) {
  const prayer = prayerType === "living" ? DATA.prayers.livingPrayer : DATA.prayers.departedPrayer;

  return `
    <article class="prayer-card">
      <h3>${escapeHtml(`После ${segmentIndex}-й славы`)}</h3>
      <div class="doxology">${renderPrayerLines(DATA.prayers.slava)}</div>
      <div class="prayer-text">${renderPrayerText(prayer.text)}</div>
      <div class="names-label">${escapeHtml(prayer.namesLabel)}</div>
      <div class="name-cloud">${renderNameCloud(prayer.names)}</div>
    </article>
  `;
}

function renderGospelAfterSecondSlava() {
  const zachalo = getMatthewZachaloForToday();

  if (!zachalo) {
    return "";
  }

  const verses = zachalo.verses
    .map(
      (verse) => `
        <div class="gospel-verse">
          <div class="gospel-verse-number">${escapeHtml(`${verse.chapter}:${verse.number}`)}</div>
          <div class="gospel-verse-text">${escapeHtml(verse.text)}</div>
        </div>
      `
    )
    .join("");

  const gospelTroparion =
    DATA.prayers.gospelBeforeMatthew?.troparion ||
    "Апо́столе святы́й Матфе́е, моли́ Ми́лостиваго Бо́га, да прегреше́ний оставле́ние пода́ст душа́м на́шим.";
  const preparationLines =
    state.prayerVersion === "full" ? [gospelTroparion, getGospelPreparationPrayer()] : [getGospelPreparationPrayer()];
  const afterGospelBlock =
    state.prayerVersion === "full"
      ? `
        <div class="prayer-block">
          <h3>Молитва после Евангелия</h3>
          <div class="prayer-text">${renderPrayerText(DATA.prayers.gospelBeforeMatthew?.afterPrayer || GOSPEL_AFTER_PRAYER)}</div>
          <div class="names-label">Имена после Евангелия</div>
          <div class="name-cloud">${renderNameCloud(DATA.prayers.livingPrayer.names)}</div>
          <div class="names-label">${escapeHtml(DATA.prayers.departedPrayer.namesLabel)}</div>
          <div class="name-cloud">${renderNameCloud(DATA.prayers.departedPrayer.names)}</div>
        </div>
      `
      : "";

  return `
    <article class="prayer-card gospel-card" id="matthew-gospel">
      <h3>Евангелие после 2-й славы</h3>
      <div class="gospel-meta">
        <span class="gospel-badge">${escapeHtml(`${zachalo.number}-е зачало`)}</span>
        <span class="gospel-reference">${escapeHtml(zachalo.reference)}</span>
      </div>
      <p class="gospel-note">
        На ${escapeHtml(zachalo.formattedDate)} читается ${escapeHtml(`${zachalo.number}-е зачало`)}. Этот блок всегда
        приводится по синодальному переводу, независимо от выбранной версии Псалтири.
      </p>
      <div class="prayer-block">
        <h3>Перед Евангелием</h3>
        <div class="prayer-text">${renderPrayerLines(preparationLines)}</div>
      </div>
      <div class="gospel-text">${verses}</div>
      ${afterGospelBlock}
    </article>
  `;
}

function renderAfterKathismaSection(kathismaId) {
  if (state.prayerVersion === "short") {
    return `
      <section class="reading-section" id="after-kathisma">
        <div class="section-header">
          <p class="card-kicker">По окончании</p>
          <h2>Молитва после кафизмы</h2>
        </div>
        <div class="prayer-flow">
          <div class="prayer-block">
            <div class="prayer-text">${renderPrayerLines(DATA.prayers.afterKathisma)}</div>
          </div>
        </div>
      </section>
    `;
  }

  const fullBlock = getFullAfterKathismaBlock(kathismaId);

  if (!fullBlock) {
    return `
      <section class="reading-section" id="after-kathisma">
        <div class="section-header">
          <p class="card-kicker">По окончании</p>
          <h2>Молитва после кафизмы</h2>
        </div>
        <div class="prayer-flow">
          <div class="prayer-block">
            <div class="prayer-text">${renderPrayerLines(DATA.prayers.afterKathisma)}</div>
          </div>
        </div>
      </section>
    `;
  }

  return `
    <section class="reading-section" id="after-kathisma">
      <div class="section-header">
        <p class="card-kicker">По окончании</p>
        <h2>Полный порядок после кафизмы</h2>
        <p class="section-lead">
          После Трисвятого по Отче наш, тропарей и 40-кратного «Господи, помилуй» сначала идёт молитва по соглашению,
          а затем последняя молитва этой кафизмы.
        </p>
      </div>
      <div class="prayer-flow">
        <div class="prayer-block">
          <h3>Трисвятое по Отче наш</h3>
          <div class="prayer-text">${renderPrayerLines(DATA.prayers.commonBeginning.slice(3, 9))}</div>
        </div>
        <div class="prayer-block">
          <h3>Тропари после кафизмы</h3>
          <div class="prayer-text">
            <p><strong>${escapeHtml(fullBlock.intro)}</strong></p>
            ${renderPrayerLines(fullBlock.troparia)}
            <p>${escapeHtml(fullBlock.lordHaveMercy)}</p>
          </div>
        </div>
        <div class="prayer-block">
          <h3>Молитва по соглашению</h3>
          <div class="prayer-text">${renderPrayerLines(DATA.prayers.afterKathisma)}</div>
        </div>
        <div class="prayer-block">
          <h3>Последняя молитва после кафизмы</h3>
          <div class="prayer-text">${renderPrayerText(fullBlock.prayer)}</div>
        </div>
      </div>
    </section>
  `;
}

function renderWeekdayHymnsSection() {
  const weekdayHymns = getWeekdayHymnsForToday();

  if (!weekdayHymns) {
    return "";
  }

  return `
    <article class="prayer-card weekday-hymns-card" id="weekday-troparia">
      <h3>${escapeHtml(weekdayHymns.title)}</h3>
      <p class="gospel-note">${escapeHtml(weekdayHymns.lead)}</p>
      <div class="weekday-hymns-grid">
        ${weekdayHymns.sections
          .map(
            (section) => `
              <div class="prayer-block weekday-hymn-block">
                <h3>${escapeHtml(section.label)}</h3>
                <div class="weekday-hymn-piece">
                  <div class="names-label">Тропарь</div>
                  <div class="prayer-text">${renderPrayerText(getWeekdayHymnText(section.troparion))}</div>
                </div>
                <div class="weekday-hymn-piece">
                  <div class="names-label">Кондак</div>
                  <div class="prayer-text">${renderPrayerText(getWeekdayHymnText(section.kontakion))}</div>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderTroparionSection() {
  const troparion = getTroparionData();

  return `
    <section class="reading-section troparion-section" id="troparia-day">
      <div class="section-header">
        <p class="card-kicker">На сегодня</p>
        <h2>Тропари дня</h2>
        <p class="section-lead">
          Открывается раздел «Тропари» на ${escapeHtml(troparion.formattedDate)} по московскому времени.
        </p>
      </div>
      <div class="troparion-actions">
        <a class="ghost-link-button" href="${escapeHtml(troparion.url)}" target="_blank" rel="noreferrer">
          Открыть отдельно
        </a>
      </div>
      <div class="troparion-frame-shell">
        <iframe
          class="troparion-frame"
          src="${escapeHtml(troparion.url)}"
          title="Тропари дня из Азбуки веры"
          loading="lazy"
          referrerpolicy="no-referrer"
        ></iframe>
      </div>
      <p class="troparion-source">
        Источник:
        <a href="${escapeHtml(troparion.url)}" target="_blank" rel="noreferrer">Азбука веры</a>
      </p>
    </section>
  `;
}

function renderReading(kathismaNumber) {
  const parallelMode = isParallelTranslation();
  const churchKathisma = getKathismaData("churchSlavonic", kathismaNumber);
  const synodalKathisma = getKathismaData("synodal", kathismaNumber);
  const kathisma = parallelMode ? churchKathisma : getKathismaData(state.translation, kathismaNumber);
  const translationLabel = getTranslationLabel();
  const prayerModeLabel = getAfterKathismaModeLabel();
  const uniquePsalmCount = new Set(kathisma.segments.flatMap((segment) => segment.psalms.map((psalm) => psalm.number))).size;

  let psalmWord = "псалмов";
  if (uniquePsalmCount % 10 === 1 && uniquePsalmCount % 100 !== 11) {
    psalmWord = "псалом";
  } else if (
    uniquePsalmCount % 10 >= 2 &&
    uniquePsalmCount % 10 <= 4 &&
    !(uniquePsalmCount % 100 >= 12 && uniquePsalmCount % 100 <= 14)
  ) {
    psalmWord = "псалма";
  }

  const segmentsHtml = kathisma.segments
    .map(
      (segment, index) => `
        <section class="segment-block" id="segment-${index + 1}">
          <div class="segment-header">
            <h3>${escapeHtml(segment.label)}</h3>
            <span class="segment-note">${
              segment.prayerType === "living" ? "После славы — молитва о живых" : "После славы — молитва об усопших"
            }</span>
          </div>
          ${segment.psalms
            .map((psalm, psalmIndex) =>
              parallelMode
                ? renderParallelPsalmCard(psalm, synodalKathisma.segments[index].psalms[psalmIndex])
                : renderPsalmCard(psalm, state.translation)
            )
            .join("")}
          ${renderPrayerCard(segment.prayerType, index + 1)}
          ${index === 0 ? renderWeekdayHymnsSection() : ""}
          ${index === 1 ? renderGospelAfterSecondSlava() : ""}
        </section>
      `
    )
    .join("");

  readingView.innerHTML = `
    <section class="reading-section">
      <div class="section-header">
        <p class="card-kicker">Текст для чтения</p>
        <h2>${escapeHtml(kathisma.title)}</h2>
        <p class="section-lead">
          Выбран ${escapeHtml(translationLabel)}. Здесь уже собраны обычное начало, сама кафизма, славы и молитвы с
          именами о здравии и об упокоении.
        </p>
        ${
          parallelMode
            ? '<p class="section-lead">В параллельном режиме сами псалмы показаны в двух столбцах: ЦСЯ слева, синодальный перевод справа.</p>'
            : ""
        }
        <p class="section-lead">${escapeHtml(prayerModeLabel)}.</p>
        <p class="section-lead">
          В этой кафизме ${uniquePsalmCount} ${psalmWord}.
        </p>
      </div>
    </section>

    <section class="reading-section" id="common-beginning">
      <div class="section-header">
        <p class="card-kicker">Перед чтением</p>
        <h2>Обычное начало</h2>
      </div>
      <div class="prayer-flow">
        <div class="prayer-block">
          <div class="prayer-text">${renderPrayerLines(getCommonBeginningLines())}</div>
        </div>
      </div>
    </section>

    <section class="reading-section">
      <div class="section-header">
        <p class="card-kicker">Сама кафизма</p>
        <h2>${escapeHtml(kathisma.title)}</h2>
      </div>
      <div class="reading-stack">${segmentsHtml}</div>
    </section>

    ${renderAfterKathismaSection(kathismaNumber)}

    ${renderTroparionSection()}
  `;
}

function render() {
  buildTranslationToggle();
  buildPrayerVersionToggle();
  renderKathismaGrid();
  renderSummary(state.kathismaId);
  renderReadingNav();
  renderReading(state.kathismaId);
  kathismaSelect.value = String(state.kathismaId);
  updateFontControls();
  updateSelectionState();
}

function initialize() {
  if (!DATA) {
    readingView.innerHTML = `
      <div class="loading-state">
        <p>Не удалось загрузить локальную базу Псалтири.</p>
      </div>
    `;
    return;
  }

  applyExternalNamesData();
  normalizeLoadedData();
  populateKathismaSelect();

  const savedTranslation = localStorage.getItem(STORAGE_KEYS.translation);
  state.translation = TRANSLATION_OPTIONS.some((option) => option.id === savedTranslation) ? savedTranslation : "churchSlavonic";
  state.prayerVersion = localStorage.getItem(STORAGE_KEYS.prayerVersion) || "full";
  state.fontScale = clampFontScale(Number(localStorage.getItem(STORAGE_KEYS.fontScale) || 1));
  applyFontScale();

  const savedKathisma = Number(localStorage.getItem(STORAGE_KEYS.kathisma) || 1);
  state.kathismaId = Number.isFinite(savedKathisma) && savedKathisma >= 1 && savedKathisma <= 20 ? savedKathisma : 1;

  kathismaSelect.addEventListener("change", (event) => {
    state.kathismaId = Number(event.target.value);
    localStorage.setItem(STORAGE_KEYS.kathisma, String(state.kathismaId));
    render();
  });

  fontDecreaseButton?.addEventListener("click", () => {
    setFontScale(state.fontScale - FONT_SCALE_STEP);
  });

  fontIncreaseButton?.addEventListener("click", () => {
    setFontScale(state.fontScale + FONT_SCALE_STEP);
  });

  fontResetButton?.addEventListener("click", () => {
    setFontScale(1);
    updateSelectionState("Размер шрифта сброшен.");
  });

  copySelectionButton?.addEventListener("click", () => {
    void copySelectedText();
  });

  document.addEventListener("selectionchange", () => {
    updateSelectionState();
  });

  render();
}

initialize();
