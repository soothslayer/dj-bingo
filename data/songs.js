/* DJ Bingo — song pools.
 * Format: [ "Title", "Artist", year, hookStartSeconds ]
 *
 * hookStartSeconds = where the 30s snippet begins. These are ESTIMATES aimed at
 * the most recognisable moment (usually the chorus or the signature riff).
 * Spot-check them in the DJ console and click "Save hooks" to correct any that
 * land badly — the value is stored in your browser and exported with the config.
 */
/* How each round is won.
 *
 * This is the knob that gets turned most often, so all four sit here together
 * rather than buried beside their song lists — you can see the shape of the
 * whole night in one glance, and change it without scrolling past 160 songs.
 *
 * Any goal defined in js/bingo.js works:
 *
 *   line        one row, column or diagonal      ~10-14 songs
 *   twoLines    any two, and they may cross      ~16-20
 *   threeLines  any three                        ~20-24
 *   stamp       any 2x2 block                    ~7-12
 *   corners     the four corner squares          ~14-20
 *   x           both diagonals                   ~23-29
 *   frame       the 16 squares round the edge    ~30-34
 *   blackout    every square on the card         ~34-38
 *
 * The patterns, and those pacing figures, live in js/bingo.js. To try a
 * different shape without editing this file, put ?goals= on any of the three
 * pages — see "Changing how a round is won" in the README.
 */
var ROUND_GOALS = {
  r1: "line",
  r2: "line",
  r3: "twoLines",
  r4: "blackout"
};

var SONGS = {
  r1: {
    label: "Round 1 — Going to the Chapel",
    tag: "wedding",
    songs: [
      ["Chapel of Love",                      "The Dixie Cups",              1964,   0],
      ["White Wedding",                       "Billy Idol",                  1982,  62],
      ["Marry You",                           "Bruno Mars",                  2010,   0],
      ["Marry Me",                            "Train",                       2009,  46],
      ["Single Ladies (Put a Ring on It)",    "Beyonce",                     2008,  42],
      ["Wedding Bell Blues",                  "The 5th Dimension",           1969,  22],
      ["Love and Marriage",                   "Frank Sinatra",               1955,   0],
      ["Band of Gold",                        "Freda Payne",                 1970,  26],
      ["Love Story",                          "Taylor Swift",                2008,  56],
      ["Speak Now",                           "Taylor Swift",                2010,  48],
      ["The Wedding Song (There Is Love)",    "Peter, Paul and Mary",        1971,   0],
      ["Dear Future Husband",                 "Meghan Trainor",              2015,  18],
      ["Marry Me",                            "Jason Derulo",                2013,  44],
      ["Grow Old with Me",                    "John Lennon",                 1984,   0],
      ["Forever and Ever, Amen",              "Randy Travis",                1987,   0],
      ["From This Moment On",                 "Shania Twain",                1998,  62],
      ["I Do (Cherish You)",                  "98 Degrees",                  1999,  46],
      ["Butterfly Kisses",                    "Bob Carlisle",                1997,  52],
      ["A Thousand Years",                    "Christina Perri",             2011,  60],
      ["Beautiful in White",                  "Shane Filan",                 2012,  56],
      ["Wouldn't It Be Nice",                 "The Beach Boys",              1966,   0],
      ["We've Only Just Begun",               "The Carpenters",              1970,   0],
      ["You're Still the One",                "Shania Twain",                1998,  44],
      ["Here and Now",                        "Luther Vandross",             1989,  52],
      ["It Had to Be You",                    "Harry Connick Jr.",           1989,   0],
      ["At Last",                             "Etta James",                  1960,   0],
      ["Bless the Broken Road",               "Rascal Flatts",               2004,  54],
      ["Sunrise, Sunset",                     "Fiddler on the Roof",         1964,   0],
      ["Congratulations",                     "Cliff Richard",               1968,   0],
      ["I'm Gonna Get Married",               "Lloyd Price",                 1959,   0],
      ["Wedding Bells",                       "Hank Williams",               1949,   0],
      ["Get Me to the Church on Time",        "Stanley Holloway",            1964,   0],
      ["Signed, Sealed, Delivered I'm Yours", "Stevie Wonder",               1970,   0],
      ["Perfect",                             "Ed Sheeran",                  2017,  60],
      ["Thinking Out Loud",                   "Ed Sheeran",                  2014,  58],
      ["All of Me",                           "John Legend",                 2013,  62],
      ["Amazed",                              "Lonestar",                    1999,  50],
      ["Lucky",                               "Jason Mraz & Colbie Caillat", 2008,  30],
      ["The Way You Look Tonight",            "Frank Sinatra",               1964,   0],
      ["The Book of Love",                    "Peter Gabriel",               2004,   0]
    ]
  },
  r2: {
    label: "Round 2 — Songs of 1976",
    tag: "1976",
    songs: [
      ["Dancing Queen",                          "ABBA",                          1976,  12],
      ["Fernando",                               "ABBA",                          1976,  46],
      ["Money, Money, Money",                    "ABBA",                          1976,  20],
      ["Don't Go Breaking My Heart",             "Elton John & Kiki Dee",         1976,   0],
      ["Sorry Seems to Be the Hardest Word",     "Elton John",                    1976,  46],
      ["Silly Love Songs",                       "Wings",                         1976,   0],
      ["Afternoon Delight",                      "Starland Vocal Band",           1976,  30],
      ["December, 1963 (Oh, What a Night)",      "The Four Seasons",              1976,   0],
      ["Love Hangover",                          "Diana Ross",                    1976,   0],
      ["Disco Lady",                             "Johnnie Taylor",                1976,   0],
      ["Kiss and Say Goodbye",                   "The Manhattans",                1976,  40],
      ["If You Leave Me Now",                    "Chicago",                       1976,   0],
      ["Tonight's the Night (Gonna Be Alright)", "Rod Stewart",                   1976,  40],
      ["A Fifth of Beethoven",                   "Walter Murphy",                 1976,   0],
      ["Boogie Fever",                           "The Sylvers",                   1976,  22],
      ["(Shake, Shake, Shake) Shake Your Booty", "KC and the Sunshine Band",      1976,   0],
      ["Convoy",                                 "C.W. McCall",                   1976,   0],
      ["50 Ways to Leave Your Lover",            "Paul Simon",                    1976,   0],
      ["Let Your Love Flow",                     "Bellamy Brothers",              1976,   0],
      ["Welcome Back",                           "John Sebastian",                1976,   0],
      ["Sara Smile",                             "Hall & Oates",                  1976,   0],
      ["I Write the Songs",                      "Barry Manilow",                 1976,  40],
      ["Dream Weaver",                           "Gary Wright",                   1976,   0],
      ["Show Me the Way",                        "Peter Frampton",                1976,  44],
      ["Baby, I Love Your Way",                  "Peter Frampton",                1976,  52],
      ["Blinded by the Light",                   "Manfred Mann's Earth Band",     1976,  40],
      ["I'd Really Love to See You Tonight",     "England Dan & John Ford Coley", 1976,  40],
      ["New Kid in Town",                        "Eagles",                        1976,  52],
      ["Hotel California",                       "Eagles",                        1976,  50],
      ["Rhiannon",                               "Fleetwood Mac",                 1976,   0],
      ["Golden Years",                           "David Bowie",                   1976,   0],
      ["The Boys Are Back in Town",              "Thin Lizzy",                    1976,  44],
      ["(Don't Fear) The Reaper",                "Blue Oyster Cult",              1976,   0],
      ["Beth",                                   "Kiss",                          1976,   0],
      ["You Should Be Dancing",                  "Bee Gees",                      1976,   0],
      ["Car Wash",                               "Rose Royce",                    1976,   0],
      ["Fly Like an Eagle",                      "Steve Miller Band",             1976,  60],
      ["Take the Money and Run",                 "Steve Miller Band",             1976,  30],
      ["More Than a Feeling",                    "Boston",                        1976,   0],
      ["Play That Funky Music",                  "Wild Cherry",                   1976,   0]
    ]
  },
  r3: {
    label: "Round 3 — Golden Oldies",
    tag: "oldies",
    songs: [
      ["Johnny B. Goode",                  "Chuck Berry",                   1958,   0],
      ["Rock Around the Clock",            "Bill Haley & His Comets",       1954,   0],
      ["Jailhouse Rock",                   "Elvis Presley",                 1957,   0],
      ["Hound Dog",                        "Elvis Presley",                 1956,   0],
      ["Great Balls of Fire",              "Jerry Lee Lewis",               1957,   0],
      ["Tutti Frutti",                     "Little Richard",                1955,   0],
      ["La Bamba",                         "Ritchie Valens",                1958,   0],
      ["That'll Be the Day",               "Buddy Holly & The Crickets",    1957,   0],
      ["Peggy Sue",                        "Buddy Holly",                   1957,   0],
      ["Blueberry Hill",                   "Fats Domino",                   1956,   0],
      ["Stand by Me",                      "Ben E. King",                   1961,   0],
      ["Runaround Sue",                    "Dion",                          1961,   0],
      ["The Twist",                        "Chubby Checker",                1960,   0],
      ["Sherry",                           "The Four Seasons",              1962,   0],
      ["Big Girls Don't Cry",              "The Four Seasons",              1962,   0],
      ["Surfin' U.S.A.",                   "The Beach Boys",                1963,   0],
      ["Good Vibrations",                  "The Beach Boys",                1966,  42],
      ["Twist and Shout",                  "The Beatles",                   1963,   0],
      ["I Want to Hold Your Hand",         "The Beatles",                   1963,   0],
      ["She Loves You",                    "The Beatles",                   1963,   0],
      ["(I Can't Get No) Satisfaction",    "The Rolling Stones",            1965,   0],
      ["My Girl",                          "The Temptations",               1964,   0],
      ["Dancing in the Street",            "Martha and the Vandellas",      1964,   0],
      ["Stop! In the Name of Love",        "The Supremes",                  1965,   0],
      ["Baby Love",                        "The Supremes",                  1964,   0],
      ["My Guy",                           "Mary Wells",                    1964,   0],
      ["I Heard It Through the Grapevine", "Marvin Gaye",                   1968,   0],
      ["Respect",                          "Aretha Franklin",               1967,  82],
      ["(Sittin' On) The Dock of the Bay", "Otis Redding",                  1968,   0],
      ["Sweet Caroline",                   "Neil Diamond",                  1969,  44],
      ["Brown Eyed Girl",                  "Van Morrison",                  1967,   0],
      ["Under the Boardwalk",              "The Drifters",                  1964,  40],
      ["Yakety Yak",                       "The Coasters",                  1958,   0],
      ["Blue Suede Shoes",                 "Carl Perkins",                  1956,   0],
      ["Runaway",                          "Del Shannon",                   1961,   0],
      ["Do Wah Diddy Diddy",               "Manfred Mann",                  1964,   0],
      ["Louie Louie",                      "The Kingsmen",                  1963,   0],
      ["Wipe Out",                         "The Surfaris",                  1963,   0],
      ["Mony Mony",                        "Tommy James and the Shondells", 1968,   0],
      ["Build Me Up Buttercup",            "The Foundations",               1968,   0]
    ]
  },
  r4: {
    label: "Round 4 — Love Songs",
    tag: "love",
    songs: [
      ["I Will Always Love You",            "Whitney Houston",             1992, 150],
      ["Endless Love",                      "Diana Ross & Lionel Richie",  1981,   0],
      ["Unchained Melody",                  "The Righteous Brothers",      1965,   0],
      ["Can't Help Falling in Love",        "Elvis Presley",               1961,   0],
      ["Something",                         "The Beatles",                 1969,   0],
      ["Wonderful Tonight",                 "Eric Clapton",                1977,   0],
      ["Just the Way You Are",              "Billy Joel",                  1977,   0],
      ["Your Song",                         "Elton John",                  1970,   0],
      ["How Deep Is Your Love",             "Bee Gees",                    1977,  40],
      ["Careless Whisper",                  "George Michael",              1984,   0],
      ["(Everything I Do) I Do It for You", "Bryan Adams",                 1991,  60],
      ["Nothing Compares 2 U",              "Sinead O'Connor",             1990,  40],
      ["Truly Madly Deeply",                "Savage Garden",               1997,  52],
      ["My Heart Will Go On",               "Celine Dion",                 1997, 110],
      ["Because You Loved Me",              "Celine Dion",                 1996,  46],
      ["I Don't Want to Miss a Thing",      "Aerosmith",                   1998,  62],
      ["Halo",                              "Beyonce",                     2008,  60],
      ["Hero",                              "Enrique Iglesias",            2001,  46],
      ["Iris",                              "Goo Goo Dolls",               1998,  62],
      ["Kiss from a Rose",                  "Seal",                        1994,  44],
      ["Wicked Game",                       "Chris Isaak",                 1989,  60],
      ["Time After Time",                   "Cyndi Lauper",                1984,  62],
      ["Take My Breath Away",               "Berlin",                      1986,  44],
      ["Faithfully",                        "Journey",                     1983,  62],
      ["Open Arms",                         "Journey",                     1981,  62],
      ["I Want to Know What Love Is",       "Foreigner",                   1984, 100],
      ["Total Eclipse of the Heart",        "Bonnie Tyler",                1983, 152],
      ["All Out of Love",                   "Air Supply",                  1980,  52],
      ["The Lady in Red",                   "Chris de Burgh",              1986,  40],
      ["Wind Beneath My Wings",             "Bette Midler",                1989, 130],
      ["Have I Told You Lately",            "Rod Stewart",                 1993,  50],
      ["Let's Stay Together",               "Al Green",                    1972,   0],
      ["Ain't No Mountain High Enough",     "Marvin Gaye & Tammi Terrell", 1967,  40],
      ["Let's Get It On",                   "Marvin Gaye",                 1973,   0],
      ["Crazy Little Thing Called Love",    "Queen",                       1979,   0],
      ["When a Man Loves a Woman",          "Percy Sledge",                1966,   0],
      ["Three Times a Lady",                "Commodores",                  1978,  60],
      ["More Than Words",                   "Extreme",                     1990,  40],
      ["Make You Feel My Love",             "Adele",                       2008,  50],
      ["Say You Won't Let Go",              "James Arthur",                2016,  46]
    ]
  }
};

var ROUND_KEYS = ["r1", "r2", "r3", "r4"];

if (typeof module !== "undefined" && module.exports) { module.exports = { SONGS: SONGS, ROUND_KEYS: ROUND_KEYS, ROUND_GOALS: ROUND_GOALS }; }
