// data.js — SUBJECT_REGISTRY and GAME_REGISTRY (pure data, no DOM)
/* jshint esversion:6 */

const SUBJECT_REGISTRY = {
  math: {
    id: 'math', name: 'Mathematics', icon: '🔢', iconClass: 'math',
    color: 'var(--math-1)', gradientFill: 'linear-gradient(90deg,#6366f1,#a78bfa)',
    timerColor: '#818cf8',
    companion: 'pet',     // which companion system this subject uses
  },
  sci: {
    id: 'sci', name: 'Science', icon: '🔬', iconClass: 'sci',
    color: 'var(--sci-1)', gradientFill: 'linear-gradient(90deg,#00d4aa,#33ddb8)',
    timerColor: '#00d4aa',
    companion: 'lab',
  },
  eng: {
    id: 'eng', name: 'English', icon: '📖', iconClass: 'eng',
    color: 'var(--eng-1)', gradientFill: 'linear-gradient(90deg,#a855f7,#bf7fff)',
    timerColor: '#a855f7',
    companion: 'castle',
  },
};

// ================================================================
// GAME REGISTRY — CBSE/NCERT/ICSE Syllabus Aligned (2025-26)
// ================================================================
const GAME_REGISTRY = {

  // ──────────────────────────────────────────────────────────────
  // MATHEMATICS
  // ──────────────────────────────────────────────────────────────
  math: {
    1: {
      tip: { title:'Parent Tip 💡', body:'Count objects at home — steps, buttons, fruits. Real-world counting sticks better than worksheets.' },
      games: [
        { id:'count_objects', icon:'🍎', bg:'rgba(255,107,53,0.18)',  name:'Count It!',       desc:'Count objects up to 20',       diff:'easy'   },
        { id:'quiz_add1',     icon:'➕', bg:'rgba(46,213,115,0.15)',  name:'Adding Fun',       desc:'Single-digit sums (1–10)',      diff:'easy'   },
        { id:'quiz_sub1',     icon:'➖', bg:'rgba(255,71,87,0.15)',   name:'Take Away!',       desc:'Subtract within 20',           diff:'easy'   },
        { id:'shape_quiz',    icon:'🔷', bg:'rgba(168,85,247,0.15)',  name:'Shape Safari',     desc:'2D & 3D shapes around us',     diff:'easy'   },
        { id:'missing_seq',   icon:'❓', bg:'rgba(255,215,0,0.15)',   name:'What Comes Next?', desc:'Number patterns 1–50',         diff:'easy'   },
        { id:'compare_nums',  icon:'⚖️', bg:'rgba(0,212,170,0.15)',   name:'Big or Small?',    desc:'Compare numbers up to 50',     diff:'easy'   },
        { id:'time_easy',     icon:'🕐', bg:'rgba(255,107,53,0.12)',  name:"Clock o'Clock",    desc:"Read o'clock & half past",     diff:'easy'   },
        { id:'money_easy',    icon:'💰', bg:'rgba(46,213,115,0.12)',  name:'Coin Count',       desc:'Identify coins & notes',       diff:'easy'   },
        { id:'measure_easy',  icon:'📏', bg:'rgba(168,85,247,0.12)', name:'Long or Short?',   desc:'Compare lengths & weights',    diff:'easy'   },
        { id:'pattern_easy',  icon:'🎨', bg:'rgba(255,215,0,0.12)',  name:'Pattern Play',     desc:'Complete AB, AAB patterns',    diff:'easy'   },
        { id:'odd_even',      icon:'🌗', bg:'rgba(0,212,170,0.12)',  name:'Odd or Even?',     desc:'Sort numbers 1–20',            diff:'medium' },
        { id:'data_easy',     icon:'📊', bg:'rgba(255,71,87,0.12)',  name:'Tally Time',       desc:'Read simple tally charts',     diff:'medium' },
      ]
    },
    2: {
      tip: { title:'Try This! 🎯', body:"Use 10 coins = 1 ten. Line them up and count in groups to make place value concrete." },
      games: [
        { id:'place_value',    icon:'🏠', bg:'rgba(0,212,170,0.15)',  name:'Tens & Units',      desc:'Numbers up to 99',             diff:'easy'   },
        { id:'quiz_add2',      icon:'➕', bg:'rgba(46,213,115,0.15)', name:'2-Digit Adder',     desc:'Add up to 99, with carry',     diff:'medium' },
        { id:'quiz_sub',       icon:'➖', bg:'rgba(255,71,87,0.15)',  name:'2-Digit Take Away', desc:'Subtract within 99',           diff:'medium' },
        { id:'multiply_groups',icon:'✖️', bg:'rgba(255,215,0,0.15)',  name:'Groups & Skip',     desc:'Multiply by 2, 5, 10',         diff:'medium' },
        { id:'division_share', icon:'➗', bg:'rgba(168,85,247,0.15)', name:'Fair Share',        desc:'Equal grouping & sharing',     diff:'medium' },
        { id:'shape_quiz',     icon:'🔷', bg:'rgba(255,107,53,0.15)', name:'3D Shape Spotter',  desc:'Cube, cone, cylinder & more',  diff:'easy'   },
        { id:'missing_seq',    icon:'❓', bg:'rgba(0,212,170,0.12)',  name:'Number Patterns',   desc:'Skip count by 2, 5, 10',       diff:'medium' },
        { id:'time_easy',      icon:'🕐', bg:'rgba(255,215,0,0.12)',  name:'Clock Challenge',   desc:'Quarter past & quarter to',    diff:'medium' },
        { id:'money_easy',     icon:'💰', bg:'rgba(46,213,115,0.12)', name:'Market Maths',      desc:'Add amounts, give change',     diff:'medium' },
        { id:'measure_easy',   icon:'📏', bg:'rgba(168,85,247,0.12)',name:'Measure Up!',        desc:'cm, m, kg & g basics',         diff:'easy'   },
        { id:'odd_even',       icon:'🌗', bg:'rgba(255,71,87,0.12)', name:'Odd or Even?',      desc:'Numbers up to 100',            diff:'easy'   },
        { id:'data_easy',      icon:'📊', bg:'rgba(0,212,170,0.12)', name:'Picture Graph',     desc:'Read pictographs',             diff:'medium' },
      ]
    },
    3: {
      tip: { title:'9× Table Magic 🪄', body:'Hold out 10 fingers. For 9×3, fold the 3rd finger. Left fingers = tens, right = units!' },
      games: [
        { id:'place_value3',   icon:'🏙️', bg:'rgba(0,212,170,0.15)',  name:'Hundreds & Thousands', desc:'4-digit place value',        diff:'medium' },
        { id:'quiz_add3',      icon:'➕', bg:'rgba(46,213,115,0.15)', name:'4-Digit Adder',     desc:'Add with carry up to 9999',    diff:'medium' },
        { id:'quiz_sub3',      icon:'➖', bg:'rgba(255,71,87,0.15)',  name:'Big Subtraction',   desc:'Subtract with borrowing',      diff:'medium' },
        { id:'quiz_mul',       icon:'✖️', bg:'rgba(255,215,0,0.15)',  name:'Times Tables',      desc:'Multiplication tables 2–10',   diff:'medium' },
        { id:'quiz_div',       icon:'➗', bg:'rgba(168,85,247,0.15)', name:'Division Quest',    desc:'Divide within 100',            diff:'medium' },
        { id:'fractions',      icon:'🍕', bg:'rgba(255,107,53,0.15)', name:'Fraction Fun',      desc:'Halves, thirds & quarters',    diff:'medium', badge:'new' },
        { id:'missing_seq',    icon:'❓', bg:'rgba(0,212,170,0.12)',  name:'Skip Count Pro',    desc:'By 3, 4, 6, 7, 8, 9',         diff:'medium' },
        { id:'time_medium',    icon:'🕐', bg:'rgba(255,215,0,0.12)',  name:'Calendar & Clock',  desc:'Minutes, hours, days, months', diff:'medium' },
        { id:'money_medium',   icon:'💰', bg:'rgba(46,213,115,0.12)', name:'Shopkeeper!',       desc:'Rupees, paise & change',       diff:'medium' },
        { id:'perimeter_easy', icon:'📐', bg:'rgba(168,85,247,0.12)',name:'Perimeter Walk',    desc:'Find the perimeter of shapes', diff:'hard'   },
        { id:'compare_nums',   icon:'⚖️', bg:'rgba(255,107,53,0.12)',name:'Number Compare',    desc:'Order 4-digit numbers',        diff:'easy'   },
        { id:'data_easy',      icon:'📊', bg:'rgba(255,71,87,0.12)', name:'Bar Graph',         desc:'Read & interpret bar graphs',  diff:'hard'   },
      ]
    },
    4: {
      tip: { title:'Mental Math Hack ⚡', body:'Multiply by 25? Multiply by 100, then ÷ 4. So 36×25 = 3600÷4 = 900!' },
      games: [
        { id:'place_value4',icon:'🚀', bg:'rgba(0,212,170,0.15)',  name:'Lakh & Beyond',     desc:'Numbers up to 10 lakhs',       diff:'medium' },
        { id:'quiz_add3',   icon:'➕', bg:'rgba(46,213,115,0.15)', name:'Large Sums',        desc:'5-digit addition',             diff:'hard'   },
        { id:'quiz_sub3',   icon:'➖', bg:'rgba(255,71,87,0.15)',  name:'Large Differences', desc:'5-digit subtraction',          diff:'hard'   },
        { id:'quiz_mul',    icon:'✖️', bg:'rgba(255,215,0,0.15)',  name:'Speed Multiply',    desc:'2-digit × 2-digit',            diff:'hard'   },
        { id:'quiz_div',    icon:'➗', bg:'rgba(168,85,247,0.15)', name:'Long Division',     desc:'Divide up to 4 digits',        diff:'hard'   },
        { id:'fractions',   icon:'🧩', bg:'rgba(255,107,53,0.15)', name:'Fraction Wars',     desc:'Compare & add fractions',      diff:'hard',   badge:'new' },
        { id:'angles_quiz', icon:'📐', bg:'rgba(0,212,170,0.12)',  name:'Angle Spotter',     desc:'Acute, obtuse, right angles',  diff:'hard'   },
        { id:'area_easy',   icon:'🟦', bg:'rgba(255,215,0,0.12)',  name:'Area Explorer',     desc:'Count squares, find area',     diff:'hard'   },
        { id:'time_medium', icon:'🕐', bg:'rgba(46,213,115,0.12)', name:'24-Hour Clock',     desc:'Convert 12hr ↔ 24hr time',    diff:'hard'   },
        { id:'money_medium',icon:'💰', bg:'rgba(168,85,247,0.12)',name:'Bill Calculator',    desc:'Estimate & calculate bills',   diff:'hard'   },
        { id:'roman_nums',  icon:'🏛️', bg:'rgba(255,107,53,0.12)',name:'Roman Numerals',    desc:'I V X L C — read & write',     diff:'hard',   badge:'new' },
        { id:'data_easy',   icon:'📊', bg:'rgba(255,71,87,0.12)', name:'Smart Charts',      desc:'Interpret bar graphs & tables',diff:'hard'   },
      ]
    }
  },

  // ──────────────────────────────────────────────────────────────
  // SCIENCE  (NCERT / EVS-based, Classes 1-4)
  // ──────────────────────────────────────────────────────────────
  sci: {
    1: {
      tip: { title:'Science Tip 🔬', body:'Let kids sort objects at home — hard/soft, rough/smooth, float/sink. Sensory sorting builds scientific thinking!' },
      games: [
        { id:'sci_living',    icon:'🌱', bg:'rgba(0,212,170,0.18)', name:'Alive or Not?',     desc:'Living vs non-living things',  diff:'easy'   },
        { id:'sci_body1',     icon:'🫀', bg:'rgba(255,107,53,0.15)',name:'My Body!',           desc:'Body parts and their jobs',    diff:'easy'   },
        { id:'sci_senses',    icon:'👁️', bg:'rgba(168,85,247,0.15)',name:'5 Senses',           desc:'See, hear, smell, taste, touch',diff:'easy'  },
        { id:'sci_animals1',  icon:'🐾', bg:'rgba(255,215,0,0.15)', name:'Animal World',       desc:'Pets, farm & wild animals',    diff:'easy'   },
        { id:'sci_plants1',   icon:'🌿', bg:'rgba(46,213,115,0.15)',name:'Plants Around Us',   desc:'Parts of a plant, needs',      diff:'easy'   },
        { id:'sci_sky',       icon:'☀️', bg:'rgba(255,71,87,0.12)', name:'Sun & Sky',          desc:'Day, night, sun, moon, stars', diff:'easy'   },
        { id:'sci_weather1',  icon:'🌧️', bg:'rgba(0,212,170,0.12)', name:'Weather Watch',      desc:'Hot, cold, rainy, sunny',      diff:'easy'   },
        { id:'sci_materials', icon:'🪨', bg:'rgba(255,107,53,0.12)',name:'Material Sort',      desc:'Hard, soft, rough, smooth',    diff:'easy'   },
        { id:'sci_food1',     icon:'🥗', bg:'rgba(46,213,115,0.12)',name:'Healthy Eating',     desc:'Fruits, veggies, grains',      diff:'easy'   },
        { id:'sci_water1',    icon:'💧', bg:'rgba(168,85,247,0.12)',name:'Water Wonders',      desc:'Uses of water, save water!',   diff:'easy'   },
        { id:'sci_transport1',icon:'🚂', bg:'rgba(255,215,0,0.12)', name:'On the Move',        desc:'Land, water & air transport',  diff:'easy'   },
        { id:'sci_family',    icon:'👨‍👩‍👧', bg:'rgba(255,71,87,0.12)',name:'My Family',           desc:'Family members & community',   diff:'easy'   },
      ]
    },
    2: {
      tip: { title:'Explore Outside! 🌍', body:'A short garden walk beats any worksheet. Ask: What eats what? What needs sunlight? Science is everywhere!' },
      games: [
        { id:'sci_foodchain1',icon:'🦁', bg:'rgba(255,107,53,0.18)',name:'Food Chains',        desc:'Who eats whom? Producer→Consumer', diff:'medium' },
        { id:'sci_habitat',   icon:'🏔️', bg:'rgba(0,212,170,0.15)', name:'Habitat Match',      desc:'Where do animals live?',       diff:'easy'   },
        { id:'sci_growth',    icon:'🌱', bg:'rgba(46,213,115,0.15)',name:'Life Cycles',        desc:'Seed → plant, egg → animal',   diff:'medium' },
        { id:'sci_states',    icon:'💧', bg:'rgba(168,85,247,0.15)',name:'Solid, Liquid, Gas', desc:'States of matter around us',   diff:'medium' },
        { id:'sci_force1',    icon:'🏀', bg:'rgba(255,215,0,0.15)', name:'Push & Pull',        desc:'Forces in everyday life',      diff:'easy'   },
        { id:'sci_body2',     icon:'🦷', bg:'rgba(255,71,87,0.15)', name:'Body Systems',       desc:'Bones, teeth, digestion',      diff:'medium' },
        { id:'sci_light1',    icon:'💡', bg:'rgba(255,107,53,0.12)',name:'Light & Shadow',     desc:'Sources of light, shadows',    diff:'easy'   },
        { id:'sci_sound1',    icon:'🔊', bg:'rgba(0,212,170,0.12)', name:'Sounds Around',      desc:'How sound travels, loud/soft', diff:'easy'   },
        { id:'sci_seasons',   icon:'🍂', bg:'rgba(255,215,0,0.12)', name:'Four Seasons',       desc:'Seasonal changes & effects',   diff:'easy'   },
        { id:'sci_soil',      icon:'🌍', bg:'rgba(46,213,115,0.12)',name:'Soil & Rocks',       desc:'Types of soil, uses of rocks', diff:'medium' },
        { id:'sci_magnets',   icon:'🧲', bg:'rgba(168,85,247,0.12)',name:'Magnet Magic',       desc:'Attract, repel, poles',        diff:'medium' },
        { id:'sci_save',      icon:'♻️', bg:'rgba(255,71,87,0.12)', name:'Save Our Planet',    desc:'Reduce, reuse, recycle',       diff:'easy'   },
      ]
    },
    3: {
      tip: { title:'Kitchen Science 🍳', body:'Mix vinegar + baking soda and watch it fizz! Ask: Is this a physical or chemical change? Class 3 science loves experiments.' },
      games: [
        { id:'sci_skeleton',  icon:'🦴', bg:'rgba(255,107,53,0.18)',name:'Skeleton & Muscles', desc:'Bones, joints, how we move',   diff:'medium' },
        { id:'sci_plants2',   icon:'🌳', bg:'rgba(46,213,115,0.15)',name:'Photosynthesis',     desc:'How plants make food',         diff:'medium' },
        { id:'sci_ecosystem', icon:'🌿', bg:'rgba(0,212,170,0.15)', name:'Ecosystems',         desc:'Food webs & biodiversity',     diff:'hard'   },
        { id:'sci_matter2',   icon:'⚗️', bg:'rgba(168,85,247,0.15)',name:'Matter & Changes',   desc:'Physical vs chemical changes', diff:'medium' },
        { id:'sci_simple_machines',icon:'⚙️',bg:'rgba(255,215,0,0.15)',name:'Simple Machines', desc:'Lever, pulley, inclined plane',diff:'medium' },
        { id:'sci_water2',    icon:'🌊', bg:'rgba(255,71,87,0.15)', name:'Water Cycle',        desc:'Evaporation, condensation, rain',diff:'medium'},
        { id:'sci_electricity',icon:'⚡',bg:'rgba(255,107,53,0.12)',name:'Circuits',           desc:'Complete the circuit!',        diff:'hard'   },
        { id:'sci_air',       icon:'🌬️', bg:'rgba(0,212,170,0.12)', name:'Air Around Us',      desc:'Wind, pressure, uses of air',  diff:'medium' },
        { id:'sci_light2',    icon:'🌈', bg:'rgba(255,215,0,0.12)', name:'Rainbows & Light',   desc:'Reflection, refraction, prism',diff:'hard'   },
        { id:'sci_animals2',  icon:'🦋', bg:'rgba(46,213,115,0.12)',name:'Animal Adaptations', desc:'How animals survive in habitats',diff:'medium'},
        { id:'sci_human',     icon:'🫀', bg:'rgba(168,85,247,0.12)',name:'Human Body Systems', desc:'Heart, lungs, brain basics',   diff:'hard'   },
        { id:'sci_planets',   icon:'🪐', bg:'rgba(255,71,87,0.12)', name:'Solar System',       desc:'Planets, orbit, the Sun',      diff:'hard',   badge:'new' },
      ]
    },
    4: {
      tip: { title:'Spark Curiosity! ✨', body:'Ask "Why does ice float?" at the dinner table. Class 4 science rewards children who question everything.' },
      games: [
        { id:'sci_cells',     icon:'🔬', bg:'rgba(0,212,170,0.18)', name:'Cell Explorer',      desc:'Plant vs animal cells',        diff:'hard'   },
        { id:'sci_reproduction',icon:'🌸',bg:'rgba(46,213,115,0.15)',name:'How Life Continues', desc:'Reproduction in plants & animals',diff:'hard' },
        { id:'sci_nutrition', icon:'🥦', bg:'rgba(255,107,53,0.15)',name:'Nutrition & Health',  desc:'Nutrients, vitamins, deficiencies',diff:'hard' },
        { id:'sci_gravity',   icon:'🌍', bg:'rgba(168,85,247,0.15)',name:'Gravity & Motion',   desc:'Gravity, friction, Newton\'s laws',diff:'hard' },
        { id:'sci_energy',    icon:'⚡', bg:'rgba(255,215,0,0.15)', name:'Energy Forms',       desc:'Kinetic, potential, heat, light',diff:'hard'  },
        { id:'sci_planets',   icon:'🪐', bg:'rgba(255,71,87,0.15)', name:'Space Explorer',     desc:'Solar system, gravity, stars',  diff:'hard',  badge:'new' },
        { id:'sci_pollution', icon:'🏭', bg:'rgba(255,107,53,0.12)',name:'Pollution & Earth',  desc:'Types of pollution, solutions', diff:'hard'   },
        { id:'sci_rocks2',    icon:'💎', bg:'rgba(0,212,170,0.12)', name:'Rocks & Minerals',  desc:'Igneous, sedimentary, metamorphic',diff:'hard' },
        { id:'sci_weather2',  icon:'🌪️', bg:'rgba(255,215,0,0.12)', name:'Weather & Climate',  desc:'Climate zones, weather patterns',diff:'hard'  },
        { id:'sci_electricity2',icon:'🔋',bg:'rgba(46,213,115,0.12)',name:'Electricity',        desc:'Conductors, insulators, circuits',diff:'hard' },
        { id:'sci_human2',    icon:'🧠', bg:'rgba(168,85,247,0.12)',name:'Nervous System',     desc:'Brain, nerves, senses & reflex', diff:'hard'  },
        { id:'sci_environment',icon:'🌎',bg:'rgba(255,71,87,0.12)', name:'Save Earth',         desc:'Ecosystems, conservation, climate',diff:'hard' },
      ]
    }
  },

  // ──────────────────────────────────────────────────────────────
  // ENGLISH  (NCERT Marigold/Raindrops + grammar, Classes 1-4)
  // ──────────────────────────────────────────────────────────────
  eng: {
    1: {
      tip: { title:'Read Aloud Daily 📖', body:'Just 10 minutes of reading aloud with your child builds vocabulary faster than any exercise book. Make it playful!' },
      games: [
        { id:'eng_letters',   icon:'🔤', bg:'rgba(168,85,247,0.18)',name:'Letter Match',       desc:'Uppercase & lowercase pairs',  diff:'easy'   },
        { id:'eng_phonics1',  icon:'🗣️', bg:'rgba(255,107,53,0.15)',name:'Sound Starter',      desc:'Beginning sounds (A for Apple)', diff:'easy'  },
        { id:'eng_cvc',       icon:'🐱', bg:'rgba(0,212,170,0.15)', name:'CVC Words',          desc:'Cat, dog, big — short vowels', diff:'easy'   },
        { id:'eng_sight1',    icon:'👀', bg:'rgba(255,215,0,0.15)', name:'Sight Words',        desc:'The, is, was, and, can — read fast!', diff:'easy' },
        { id:'eng_rhyme',     icon:'🎵', bg:'rgba(46,213,115,0.15)',name:'Rhyme Time',         desc:'Words that sound the same',    diff:'easy'   },
        { id:'eng_sentence1', icon:'📝', bg:'rgba(255,71,87,0.15)', name:'My First Sentence',  desc:'Build simple sentences',       diff:'easy'   },
        { id:'eng_nouns1',    icon:'🏷️', bg:'rgba(168,85,247,0.12)',name:'Name Game (Nouns)',  desc:'People, places, animals, things', diff:'easy'  },
        { id:'eng_picture',   icon:'🖼️', bg:'rgba(255,107,53,0.12)',name:'Picture Story',      desc:'What is happening in the picture?', diff:'easy' },
        { id:'eng_colours',   icon:'🎨', bg:'rgba(0,212,170,0.12)', name:'Colour Words',       desc:'Spell red, blue, green and more',diff:'easy'  },
        { id:'eng_abc_order', icon:'🔡', bg:'rgba(255,215,0,0.12)', name:'ABC Order',          desc:'Arrange words alphabetically', diff:'easy'   },
        { id:'eng_opposite1', icon:'↔️', bg:'rgba(46,213,115,0.12)',name:'Opposites!',         desc:'Hot–cold, big–small, day–night',diff:'easy'  },
        { id:'eng_question1', icon:'❓', bg:'rgba(255,71,87,0.12)', name:'Question Words',     desc:'Who, what, where, when, why',  diff:'medium' },
      ]
    },
    2: {
      tip: { title:'Word Wall Magic ✨', body:'Stick 5 new words on the fridge each week. By seeing them daily, kids absorb vocabulary without even trying!' },
      games: [
        { id:'eng_blends',    icon:'🔀', bg:'rgba(168,85,247,0.18)',name:'Consonant Blends',   desc:'bl, cr, st, tr — blend sounds!',diff:'medium' },
        { id:'eng_vowels',    icon:'🔤', bg:'rgba(255,107,53,0.15)',name:'Long & Short Vowels', desc:'Cake vs cat, kite vs kit',      diff:'medium' },
        { id:'eng_sight2',    icon:'👀', bg:'rgba(0,212,170,0.15)', name:'Sight Words 2',      desc:'Because, every, people, their', diff:'medium' },
        { id:'eng_plurals',   icon:'🐑', bg:'rgba(255,215,0,0.15)', name:'One or Many?',       desc:'Plural rules: -s, -es, -ies',   diff:'medium' },
        { id:'eng_adjectives',icon:'🌟', bg:'rgba(46,213,115,0.15)',name:'Describing Words',   desc:'Adjectives that paint pictures!',diff:'medium'},
        { id:'eng_verbs1',    icon:'🏃', bg:'rgba(255,71,87,0.15)', name:'Action Words',       desc:'Run, jump, eat — present tense',diff:'medium' },
        { id:'eng_punctuation',icon:'.',bg:'rgba(168,85,247,0.12)',name:'Punctuation Pro',    desc:'. , ! ? — place them right',    diff:'medium' },
        { id:'eng_sentence2', icon:'📝', bg:'rgba(255,107,53,0.12)',name:'Sentence Builder',   desc:'Subject + verb + object',      diff:'medium' },
        { id:'eng_story1',    icon:'📚', bg:'rgba(0,212,170,0.12)', name:'Story Sequence',     desc:'Put events in the right order', diff:'medium' },
        { id:'eng_spell2',    icon:'✍️', bg:'rgba(255,215,0,0.12)', name:'Spelling Bee Jnr',  desc:'Common 2-syllable words',      diff:'medium' },
        { id:'eng_synonym1',  icon:'🔄', bg:'rgba(46,213,115,0.12)',name:'Same Meaning',       desc:'Big = large, happy = joyful',  diff:'medium' },
        { id:'eng_question2', icon:'❓', bg:'rgba(255,71,87,0.12)', name:'Comprehension',      desc:'Read a short passage, answer', diff:'hard'   },
      ]
    },
    3: {
      tip: { title:'Grammar in Context 📝', body:'Instead of exercises, notice grammar in storybooks! "That\'s past tense — what\'s the rule?" Reading makes grammar stick.' },
      games: [
        { id:'eng_tense1',    icon:'⏰', bg:'rgba(168,85,247,0.18)',name:'Tense Traveller',    desc:'Past, present, future',         diff:'medium' },
        { id:'eng_pronouns',  icon:'👤', bg:'rgba(255,107,53,0.15)',name:'Pronoun Power',      desc:'I, he, she, they, we, it',      diff:'medium' },
        { id:'eng_articles',  icon:'📌', bg:'rgba(0,212,170,0.15)', name:'A, An or The?',      desc:'Articles in context',           diff:'medium' },
        { id:'eng_prefixes',  icon:'🔧', bg:'rgba(255,215,0,0.15)', name:'Prefix Power',       desc:'Un-, re-, pre- — change meaning!',diff:'medium'},
        { id:'eng_suffixes',  icon:'🔩', bg:'rgba(46,213,115,0.15)',name:'Suffix Squad',       desc:'-ful, -less, -er, -est',        diff:'medium' },
        { id:'eng_compound',  icon:'➕', bg:'rgba(255,71,87,0.15)', name:'Compound Words',     desc:'Rain + bow = rainbow!',         diff:'easy'   },
        { id:'eng_idioms1',   icon:'🤔', bg:'rgba(168,85,247,0.12)',name:'What Does It Mean?', desc:'Simple idioms explained',       diff:'hard'   },
        { id:'eng_direct',    icon:'💬', bg:'rgba(255,107,53,0.12)',name:'Direct Speech',      desc:'Quotation marks & said/asked',  diff:'hard'   },
        { id:'eng_story2',    icon:'📖', bg:'rgba(0,212,170,0.12)', name:'Story Elements',     desc:'Character, setting, plot',      diff:'medium' },
        { id:'eng_spell3',    icon:'✍️', bg:'rgba(255,215,0,0.12)', name:'Spelling Bee',       desc:'Tricky 3-syllable words',       diff:'hard'   },
        { id:'eng_paragraph', icon:'📄', bg:'rgba(46,213,115,0.12)',name:'Paragraph Power',    desc:'Main idea, supporting details', diff:'hard'   },
        { id:'eng_poem',      icon:'🎭', bg:'rgba(255,71,87,0.12)', name:'Poetry Corner',      desc:'Rhyme scheme, rhythm, simile',  diff:'hard',   badge:'new' },
      ]
    },
    4: {
      tip: { title:'Write Every Day ✍️', body:"A 5-sentence diary entry daily transforms children's writing. Ask: What did you see today? What would you change?" },
      games: [
        { id:'eng_tense2',    icon:'⏰', bg:'rgba(168,85,247,0.18)',name:'Tense Master',       desc:'Perfect tenses & continuous',   diff:'hard'   },
        { id:'eng_passive',   icon:'🔄', bg:'rgba(255,107,53,0.15)',name:'Active vs Passive',  desc:'The cat ate the mouse / was eaten',diff:'hard' },
        { id:'eng_clauses',   icon:'🔗', bg:'rgba(0,212,170,0.15)', name:'Clauses & Phrases',  desc:'Main, subordinate, conjunctions',diff:'hard'  },
        { id:'eng_figure',    icon:'🎭', bg:'rgba(255,215,0,0.15)', name:'Figure of Speech',   desc:'Simile, metaphor, personification',diff:'hard' },
        { id:'eng_formal',    icon:'📧', bg:'rgba(46,213,115,0.15)',name:'Letter Writing',     desc:'Formal & informal letter format',diff:'hard'  },
        { id:'eng_essay',     icon:'📝', bg:'rgba(255,71,87,0.15)', name:'Essay Builder',      desc:'Introduction, body, conclusion', diff:'hard'  },
        { id:'eng_vocabulary',icon:'📚', bg:'rgba(168,85,247,0.12)',name:'Word Power',         desc:'Advanced vocabulary in context', diff:'hard'  },
        { id:'eng_comprehension',icon:'🔍',bg:'rgba(255,107,53,0.12)',name:'Deep Reading',     desc:'Inference, theme, author intent',diff:'hard'  },
        { id:'eng_story3',    icon:'🌟', bg:'rgba(0,212,170,0.12)', name:'Story Writing',      desc:'Write with setting & conflict',  diff:'hard'  },
        { id:'eng_idioms2',   icon:'🤔', bg:'rgba(255,215,0,0.12)', name:'Idioms & Proverbs',  desc:'Common sayings & their meanings',diff:'hard'  },
        { id:'eng_debate',    icon:'⚖️', bg:'rgba(46,213,115,0.12)',name:'Debate Time!',       desc:'Arguments for & against',       diff:'hard',  badge:'new' },
        { id:'eng_spell4',    icon:'✍️', bg:'rgba(255,71,87,0.12)', name:'Spelling Champion', desc:'Advanced spelling patterns',     diff:'hard'  },
      ]
    }
  }
};

// STATE (runtime — not game data)
