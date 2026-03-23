// data.js — SUBJECT_REGISTRY and GAME_REGISTRY (pure data, no DOM)
/* jshint esversion:6 */

const SUBJECT_REGISTRY = {
  math: {
    id: 'math',
    name: 'Mathematics',
    icon: '🔢',
    iconClass: 'math',
    color: 'var(--math-1)',
    gradientFill: 'linear-gradient(90deg, #6366f1, #a78bfa)',
    timerColor: '#818cf8',
  },
  // Future: sci, eng, evs entries go here
};

// ================================================================
// GAME REGISTRY — CBSE/ICSE/NCERT Syllabus Aligned (2025-26)
// Sources: Joyful Mathematics (Cl.1-2), Maths Mela (Cl.3), Math-Magic (Cl.4)
// Each class covers: Numbers, Operations, Measurement, Time, Money,
//                    Geometry, Patterns, Data Handling — progressively.
// ================================================================
const GAME_REGISTRY = {
  math: {

    // ── CLASS 1 ─────────────────────────────────────────────
    // NCERT: Joyful Mathematics | Topics: Pre-number concepts,
    // Numbers 1-99, Addition/Subtraction up to 20, Shapes,
    // Measurement (length/weight), Time, Money, Patterns, Data Handling
    1: {
      tip: {
        title: "Parent Tip 💡",
        body: "Class 1 is about building number sense! Count objects at home — steps, buttons, fruits. Real-world counting sticks better than worksheets."
      },
      games: [
        { id:'count_objects',   icon:'🍎', bg:'rgba(255,107,53,0.18)', name:'Count It!',        desc:'Count objects up to 20',       diff:'easy'   },
        { id:'quiz_add1',       icon:'➕', bg:'rgba(46,213,115,0.15)', name:'Adding Fun',        desc:'Single-digit sums (1-10)',     diff:'easy'   },
        { id:'quiz_sub1',       icon:'➖', bg:'rgba(255,71,87,0.15)',  name:'Take Away!',        desc:'Subtract within 20',           diff:'easy'   },
        { id:'shape_quiz',      icon:'🔷', bg:'rgba(168,85,247,0.15)', name:'Shape Safari',      desc:'2D & 3D shapes around us',     diff:'easy'   },
        { id:'missing_seq',     icon:'❓', bg:'rgba(255,215,0,0.15)',  name:'What Comes Next?',  desc:'Number patterns 1-50',         diff:'easy'   },
        { id:'compare_nums',    icon:'⚖️', bg:'rgba(0,212,170,0.15)',  name:'Big or Small?',     desc:'Compare numbers up to 50',     diff:'easy'   },
        { id:'time_easy',       icon:'🕐', bg:'rgba(255,107,53,0.12)', name:'Clock o\'Clock',    desc:'Read o\'clock & half past',    diff:'easy'   },
        { id:'money_easy',      icon:'💰', bg:'rgba(46,213,115,0.12)', name:'Coin Count',        desc:'Identify coins & notes',       diff:'easy'   },
        { id:'measure_easy',    icon:'📏', bg:'rgba(168,85,247,0.12)', name:'Long or Short?',    desc:'Compare lengths & weights',    diff:'easy'   },
        { id:'pattern_easy',    icon:'🎨', bg:'rgba(255,215,0,0.12)',  name:'Pattern Play',      desc:'Complete AB, AAB patterns',    diff:'easy'   },
        { id:'odd_even',        icon:'🌗', bg:'rgba(0,212,170,0.12)',  name:'Odd or Even?',      desc:'Sort numbers 1-20',            diff:'medium' },
        { id:'data_easy',       icon:'📊', bg:'rgba(255,71,87,0.12)',  name:'Tally Time',        desc:'Read simple tally charts',     diff:'medium' },
      ]
    },

    // ── CLASS 2 ─────────────────────────────────────────────
    // NCERT: Joyful Mathematics | Topics: Numbers up to 1000,
    // 3-digit addition/subtraction, Multiplication intro,
    // Division intro (grouping/sharing), Shapes, Measurement
    // (cm/m, kg/g), Time (days/weeks/months), Money, Data
    2: {
      tip: {
        title: "Try This! 🎯",
        body: "Use 10 coins = 1 ten. Line them up and count in groups of 10 to make place value concrete. Class 2 is the year kids 'get' two-digit numbers!"
      },
      games: [
        { id:'place_value',     icon:'🏠', bg:'rgba(0,212,170,0.15)',  name:'Tens & Units',      desc:'Numbers up to 99',             diff:'easy'   },
        { id:'quiz_add2',       icon:'➕', bg:'rgba(46,213,115,0.15)', name:'2-Digit Adder',     desc:'Add up to 99, with carry',     diff:'medium' },
        { id:'quiz_sub',        icon:'➖', bg:'rgba(255,71,87,0.15)',  name:'2-Digit Take Away', desc:'Subtract within 99',           diff:'medium' },
        { id:'multiply_groups', icon:'✖️', bg:'rgba(255,215,0,0.15)',  name:'Groups & Skip',     desc:'Multiply by 2, 5, 10',         diff:'medium' },
        { id:'division_share',  icon:'➗', bg:'rgba(168,85,247,0.15)', name:'Fair Share',        desc:'Equal grouping & sharing',     diff:'medium' },
        { id:'shape_quiz',      icon:'🔷', bg:'rgba(255,107,53,0.15)', name:'3D Shape Spotter',  desc:'Cube, cone, cylinder & more',  diff:'easy'   },
        { id:'missing_seq',     icon:'❓', bg:'rgba(0,212,170,0.12)',  name:'Number Patterns',   desc:'Skip count by 2, 5, 10',       diff:'medium' },
        { id:'time_easy',       icon:'🕐', bg:'rgba(255,215,0,0.12)',  name:'Clock Challenge',   desc:'Quarter past & quarter to',    diff:'medium' },
        { id:'money_easy',      icon:'💰', bg:'rgba(46,213,115,0.12)', name:'Market Maths',      desc:'Add amounts, give change',     diff:'medium' },
        { id:'measure_easy',    icon:'📏', bg:'rgba(168,85,247,0.12)', name:'Measure Up!',       desc:'cm, m, kg & g basics',         diff:'easy'   },
        { id:'odd_even',        icon:'🌗', bg:'rgba(255,71,87,0.12)',  name:'Odd or Even?',      desc:'Numbers up to 100',            diff:'easy'   },
        { id:'data_easy',       icon:'📊', bg:'rgba(0,212,170,0.12)',  name:'Picture Graph',     desc:'Read pictographs',             diff:'medium' },
      ]
    },

    // ── CLASS 3 ─────────────────────────────────────────────
    // NCERT: Maths Mela | Topics: Numbers up to 10,000,
    // 4-digit addition/subtraction with carry/borrow,
    // Multiplication tables 2-10, Division, Fractions (1/2, 1/4, etc.),
    // Geometry (angles concept, shapes), Perimeter intro,
    // Time (calendar, hours/minutes), Money (rupees & paise), Data
    3: {
      tip: {
        title: "9× Table Magic 🪄",
        body: "Hold out 10 fingers. For 9×3, fold the 3rd finger. Count fingers on the LEFT (2) = tens digit. Count fingers on RIGHT (7) = units digit. Answer: 27!"
      },
      games: [
        { id:'place_value3',    icon:'🏙️', bg:'rgba(0,212,170,0.15)',  name:'Hundreds & Thousands', desc:'4-digit place value',        diff:'medium' },
        { id:'quiz_add3',       icon:'➕', bg:'rgba(46,213,115,0.15)', name:'4-Digit Adder',     desc:'Add with carry up to 9999',    diff:'medium' },
        { id:'quiz_sub3',       icon:'➖', bg:'rgba(255,71,87,0.15)',  name:'Big Subtraction',   desc:'Subtract with borrowing',      diff:'medium' },
        { id:'quiz_mul',        icon:'✖️', bg:'rgba(255,215,0,0.15)',  name:'Times Tables',      desc:'Multiplication tables 2-10',   diff:'medium' },
        { id:'quiz_div',        icon:'➗', bg:'rgba(168,85,247,0.15)', name:'Division Quest',    desc:'Divide within 100',            diff:'medium' },
        { id:'fractions',       icon:'🍕', bg:'rgba(255,107,53,0.15)', name:'Fraction Fun',      desc:'Halves, thirds & quarters',    diff:'medium', badge:'new' },
        { id:'missing_seq',     icon:'❓', bg:'rgba(0,212,170,0.12)',  name:'Skip Count Pro',    desc:'By 3, 4, 6, 7, 8, 9',         diff:'medium' },
        { id:'time_medium',     icon:'🕐', bg:'rgba(255,215,0,0.12)',  name:'Calendar & Clock',  desc:'Minutes, hours, days, months', diff:'medium' },
        { id:'money_medium',    icon:'💰', bg:'rgba(46,213,115,0.12)', name:'Shopkeeper!',       desc:'Rupees, paise & change',       diff:'medium' },
        { id:'perimeter_easy',  icon:'📐', bg:'rgba(168,85,247,0.12)', name:'Perimeter Walk',    desc:'Find the perimeter of shapes', diff:'hard'   },
        { id:'compare_nums',    icon:'⚖️', bg:'rgba(255,107,53,0.12)', name:'Number Compare',    desc:'Order 4-digit numbers',        diff:'easy'   },
        { id:'data_easy',       icon:'📊', bg:'rgba(255,71,87,0.12)',  name:'Bar Graph',         desc:'Read & interpret bar graphs',  diff:'hard'   },
      ]
    },

    // ── CLASS 4 ─────────────────────────────────────────────
    // NCERT: Math-Magic | Topics: Large numbers (lakhs),
    // 4-digit operations, Long multiplication & division,
    // Fractions (equivalent, compare, operations),
    // Geometry (angles: acute/obtuse/right, area), Measurement
    // (km, conversion), Time (24-hr, elapsed time), Money (bills),
    // Roman numerals, Data (bar graphs, timetable problems)
    4: {
      tip: {
        title: "Mental Math Hack ⚡",
        body: "Multiply by 25? Multiply by 100, then ÷ 4. So 36×25 = 3600÷4 = 900. Multiply by 5? Halve the number, then ×10. 48×5 = 24×10 = 240!"
      },
      games: [
        { id:'place_value4',    icon:'🚀', bg:'rgba(0,212,170,0.15)',  name:'Lakh & Beyond',     desc:'Numbers up to 10 lakhs',       diff:'medium' },
        { id:'quiz_add3',       icon:'➕', bg:'rgba(46,213,115,0.15)', name:'Large Sums',        desc:'5-digit addition',             diff:'hard'   },
        { id:'quiz_sub3',       icon:'➖', bg:'rgba(255,71,87,0.15)',  name:'Large Differences', desc:'5-digit subtraction',          diff:'hard'   },
        { id:'quiz_mul',        icon:'✖️', bg:'rgba(255,215,0,0.15)',  name:'Speed Multiply',    desc:'2-digit × 2-digit',            diff:'hard'   },
        { id:'quiz_div',        icon:'➗', bg:'rgba(168,85,247,0.15)', name:'Long Division',     desc:'Divide up to 4 digits',        diff:'hard'   },
        { id:'fractions',       icon:'🧩', bg:'rgba(255,107,53,0.15)', name:'Fraction Wars',     desc:'Compare & add fractions',      diff:'hard',   badge:'new' },
        { id:'angles_quiz',     icon:'📐', bg:'rgba(0,212,170,0.12)',  name:'Angle Spotter',     desc:'Acute, obtuse, right angles',  diff:'hard'   },
        { id:'area_easy',       icon:'🟦', bg:'rgba(255,215,0,0.12)',  name:'Area Explorer',     desc:'Count squares, find area',     diff:'hard'   },
        { id:'time_medium',     icon:'🕐', bg:'rgba(46,213,115,0.12)', name:'24-Hour Clock',     desc:'Convert 12hr ↔ 24hr time',    diff:'hard'   },
        { id:'money_medium',    icon:'💰', bg:'rgba(168,85,247,0.12)', name:'Bill Calculator',   desc:'Estimate & calculate bills',   diff:'hard'   },
        { id:'roman_nums',      icon:'🏛️', bg:'rgba(255,107,53,0.12)', name:'Roman Numerals',    desc:'I V X L C — read & write',     diff:'hard',   badge:'new' },
        { id:'data_easy',       icon:'📊', bg:'rgba(255,71,87,0.12)',  name:'Smart Charts',      desc:'Interpret bar graphs & tables',diff:'hard'   },
      ]
    }
  }
  // sci: { 1:{...}, 2:{...}, 3:{...}, 4:{...} } — add when ready
};

// ================================================================
// STATE
// ================================================================
