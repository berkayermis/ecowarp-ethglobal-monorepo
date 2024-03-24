import pandas as pd
import random


# Function to randomly combine parts of different posts
def mix_posts(posts):
    if len(posts) < 2:
        return posts[0] if posts else ""
    part_one = random.choice(posts)
    part_two = random.choice(posts)
    # Splitting the posts and combining parts
    mixed = (
        " ".join(part_one.split()[: len(part_one) // 2])
        + " "
        + " ".join(part_two.split()[len(part_two) // 2 :])
    )
    return mixed


# Function to generate mock posts
def generate_mock_casts(num_posts=100000):
    data = []
    categories = ["electronics", "books", "arts"]
    base_posts = {
        "electronics": [
            "Excited about the upcoming Galaxy release! 🚀 Anyone else waiting? #tech #Samsung",
            "How do I fix a laptop that won't turn on? Tried everything! 😞 #techhelp",
            "Reviewing the latest smartwatch: battery life is a game changer! ⌚️ #gadgetreview",
            "Just got the new iPhone 15! The camera is AMAZING 🤩 #tech #gadgets",
            "Can't decide between the latest tablet models – any advice? 🤔 #techdilemma",
            "Finally upgraded my PC! The new graphics card is a beast for gaming. 🎮 #PCBuild",
            "Anyone else excited about the VR tech showcased at the expo? Feels like the future! #VR",
            "Struggling to set up my smart home devices. Does anyone have a simple guide? #smarthome",
            "Loving my new wireless headphones, perfect sound clarity and no more tangled wires! #audiophile",
            "Drone photography is taking my travel content to new heights! Literally! 🚁 #dronestagram",
            "Is anyone else having issues with their phone battery draining too fast? #techproblems",
            "Just watched a documentary on the evolution of mobile phones. It’s incredible how far we’ve come! #technology",
            "Looking for a durable laptop that can handle daily wear and tear. Recommendations? #techhelp",
            "Debating if I should switch to an electric car. Anyone have experience with long-term costs? 🚗 #ElectricVehicle",
            "Obsessed with the new fitness tracker features, especially the sleep analysis! 🌜#FitTech",
            "Dealing with overheating issues on my gaming rig. Has anyone faced this before? #GamingPC",
            "Just set up my smart lighting system, and it's a game-changer for movie nights! 💡#SmartHome",
            "The debate between console and PC gaming is intense. Where do you stand? 🎮#GamerLife",
            "E-reader or traditional books? Can't decide which is better for travel. 📚#TechChoices",
            "How essential is a dual monitor setup for productivity? Can't decide if I should upgrade. 🖥️#TechSetup",
            "Solar power chargers – are they worth it for backpacking trips? ☀️#EcoTech",
            "Lost without my GPS watch on my morning run, never realized how much I relied on it! 🏃‍♂️#RunningTech",
            "Is the hype around 5G worth it? Trying to understand the real-world benefits. 📱#5GTechnology",
            "My journey into building my own mechanical keyboard has begun. Any tips? ⌨️#MechanicalKeyboards",
            "What's the best antivirus software right now? Feeling paranoid about security. 🔒#TechSafety",
            "Has anyone else tried augmented reality games? They're unreal! #ARGaming",
            "Thinking of starting a tech podcast. What topics would you like to hear about? 🎙️#TechTalk",
            "Need a new router – any suggestions for fast speeds and wide coverage? 📶#TechSupport",
            "The leap in camera phone technology is wild. Remember when a 3MP camera was amazing? 📸#TechEvolution",
            "Retro gaming is making a comeback! Which classic games are a must-play? 🕹️#RetroGaming",
            "I'm torn between different smartwatch brands. Which do you prefer and why? ⌚#TechChoices",
            "Exploring the world of home automation. It's like living in the future! #SmartLiving",
            "How often do you clean your tech gadgets? Looking for maintenance tips. 🧼#TechCare",
            "Just tried a meditation app on my smartwatch, and it's surprisingly effective! #WellnessTech",
            "Debating whether to buy a robot vacuum. Do they really work well? 🤖#HomeTech",
            "Does anyone else find coding more fun on a high-res display? Text is so crisp! #DevLife",
            "Looking for a good beginner's drone that won't break the bank. Any suggestions? #DroneHobby",
            "The new space-themed mobile game is addictively good. Anyone else playing? 🌌#MobileGaming",
            "Trying to find the best soundbar for my TV setup without overspending. Any advice? 📺#HomeAudio",
            "Smart fridges: cool tech or unnecessary gimmick? What do you think? 🍽️#KitchenTech",
            "Upgrading my home office setup. What are your work-from-home essentials? 💼#RemoteWork",
            "The water resistance feature on phones has saved me more than once! Anyone else? 💦#TechLifeSavers",
            "How do you manage your digital photos and backups? I'm drowning in files here! 💾#DataManagement",
            "Virtual reality workouts are a thing, and I'm intrigued. Has anyone tried them? 🏋️‍♂️#VRTech",
        ],
        "books": [
            "Anyone read any good thrillers lately? Need recommendations! #bookworm",
            "Can't believe the twist in the latest John Grisham book! 📚 #shocked #reading",
            "Just started 'Educated' by Tara Westover - it's gripping! #memoir #books",
            "Finished reading 'The Martian' - such a thrilling sci-fi adventure! Highly recommend 👍 #books #scifi",
            "Diving into the world of fantasy with 'The Name of the Wind' – can't put it down! #fantasybooks",
            "Anyone else adore the whimsical writing of Neil Gaiman? #booklover",
            "The autobiography of Malcolm X is eye-opening. A must-read! #history #biography",
            "In love with the poetic prose of 'Ocean Vuong'. A masterpiece. #literature",
            "Looking for book club suggestions – we enjoy mysteries and historical fiction. #bookclub",
            "Just finished '1984' by George Orwell, chillingly relevant. #classicreads",
            "On a Agatha Christie spree – her mysteries never get old! 🕵️‍♂️ #mysterynovels",
            "Seeking graphic novel recommendations – something epic and colorful! #graphicnovels",
            "The latest cookbook I got has some amazing vegan recipes! 🌱 #cookbooks",
            "Revisiting 'To Kill a Mockingbird', it resonates differently each time. #HarperLee",
            "Rediscovering the joys of 'The Hobbit'. Tolkien's world is timeless! 🌍#FantasyBooks",
            "The psychology books by Malcolm Gladwell are mind-bending! Any fans? 🧠#NonFiction",
            "Struggling to get through 'War and Peace'. Any tips for tackling long classics? 📚#ReadingChallenge",
            "Graphic novels are real literature too! 'Watchmen' blew my mind. #GraphicNovels",
            "Has anyone read any good poetry lately? Looking for something stirring. 📖#Poetry",
            "The 'Harry Potter' series really ignited my love for reading as a kid. #NostalgiaReads",
            "Exploring non-Western authors this month. Any recommendations? 🌏#WorldLiterature",
            "Just dove into the world of self-help books. Feeling motivated! 💪#SelfImprovement",
            "Re-reading 'Pride and Prejudice' and appreciating Austen's wit more than ever. #ClassicLiterature",
            "Suggest some underrated authors who deserve more recognition! 📚#HiddenGems",
            "Anyone into historical biographies? Just finished one on Cleopatra and it was fascinating! #HistoryBuff",
            "Seeking sci-fi recommendations with strong female leads. Any ideas? 🌌#SciFiReads",
            "Just got into the murder mystery genre and I'm hooked! Any must-reads? 🔍#MysteryBooks",
            "Exploring the world through travel diaries. Makes me want to pack my bags! 🌍#TravelBooks",
            "What are some must-read classic novels that you think everyone should experience? 📚#TimelessReads",
            "Diving into the life stories of famous musicians – their journeys are so inspiring! 🎵#Biographies",
            "Children's books aren't just for kids – they have lessons for adults too! #ChildrensLiterature",
            "Which book has impacted your life the most and why? Always looking for life-changing reads. #InspirationalBooks",
            "Starting a series about powerful women in history. Any recommendations? #FeministReads",
            "Who else loves chilling with a cozy mystery on a rainy day? ☔#CozyMysteries",
            "The world-building in Brandon Sanderson’s novels is unparalleled. #FantasyFiction",
            "Delving into classic Russian literature – any tips for a newbie? 🇷🇺#RussianClassics",
            "Young adult fiction isn’t just for teens – so many profound themes and relatable stories. #YALit",
            "Who else finds reading a book much more fulfilling than binge-watching a series? 📖#ReadMore",
            "Looking for a book that combines both humor and depth. Any suggestions? 😄#HumorousReads",
            "Exploring dark academia books – the aesthetic and themes are intriguing! 🏛️#DarkAcademia",
            "Do audiobooks count as reading? I find them incredibly convenient. 🎧#Audiobooks",
            "Fascinated by mythological stories from different cultures. What should I read next? 🐉#MythologyBooks",
            "Searching for epic love stories that stand the test of time. 💘#RomanceReads",
            "Has anyone delved into interactive or 'choose your own adventure' books? 🕹️#InteractiveFiction",
            "The more I read about quantum physics in layman’s terms, the more fascinated I become. 🌌#ScienceBooks",
            "Memoirs that read like novels are my new favorite. They’re so immersive! 📖#MemoirReads",
            "Seeking out books that tackle environmental issues – any recommendations? 🌱#EcoLit",
            "Who else enjoys novels that blend fiction with historical facts? #HistoricalFiction",
            "Need a laugh – what’s the funniest book you’ve ever read? 😂#ComedyBooks",
            "Venturing into the world of epic sagas. I’m ready for a long journey! 📚#EpicSagas",
            "The power of poetry to heal and inspire is unmatched. Who are your favorite poets? 📜#PoetryLove",
            "Dystopian novels have a strange appeal. Which one should I start with? 🌆#DystopianFiction",
            "Looking for something that combines mystery, history, and a bit of supernatural. Any ideas? 🔮#MysteryFantasy",
            "Craving for a deep, philosophical read that challenges my perspectives. #PhilosophyBooks",
            "Who are some contemporary authors that you believe will stand the test of time? 📚#ModernClassics",
        ],
        "arts": [
            "Visited the modern art museum today - left feeling so inspired! 🎨 #artlovers",
            "Experimenting with acrylics this weekend, any tips? #painting #creative",
            "Anyone know good art classes in the area? Want to brush up on my skills! #artclass #learning",
            "My latest watercolor painting is inspired by the changing seasons 🎨 What do you think? #art #watercolor",
            "Took a pottery class and made my first bowl. So therapeutic! #pottery #handmade",
            "Exploring street art in Berlin has been an incredible experience. #streetart #Berlin",
            "Does anyone know of good digital art software for beginners? #digitalart",
            "I'm looking to decorate my room with indie movie posters. Any recommendations? #homedecor",
            "Attended a local theater production last night. It's vital to support local arts! #theater",
            "I’m learning to play the guitar, any tips for beginners? #music #guitar",
            "Crafting my own jewelry has been such a rewarding hobby! #DIY #jewelrymaking",
            "The contrast between Baroque and Renaissance art is fascinating. #arthistory",
            "Seeking inspiration for my next photography project. Nature vs. urban – any thoughts? #photography",
            "Anyone else into scrapbooking? Looking for creative layout ideas! #scrapbooking",
            "Exploring the fusion of traditional and digital art forms. The possibilities seem endless! #ArtEvolution",
            "Sculpture or painting – which do you find more expressive and why? #ArtDiscussion",
            "Discovering the vibrant world of street photography. It tells so many untold stories! 📸#StreetPhotography",
            "The process of creating art can be as fascinating as the final piece itself. #CreativeProcess",
            "Attending an art workshop this weekend. Can’t wait to learn and create! #ArtWorkshop",
            "Doodling has become my go-to stress buster. Anyone else find it therapeutic? ✏️#DoodleArt",
            "The history and techniques behind mural art are so captivating! #MuralArt",
            "Exploring the delicate art of paper quilling. The detail is astounding! #PaperArt",
            "The rise of digital art has transformed the art world. What’s your take on this shift? #DigitalArt",
            "Does anyone else collect vintage art posters? There’s something nostalgic and beautiful about them. #VintageArt",
            "Trying my hand at calligraphy, it's amazing how much the style of lettering can change the vibe of words. #CalligraphyArt",
            "Art therapy sessions have been enlightening. It’s incredible how art can help one heal and understand themselves. #ArtTherapy",
            "Delving into the world of abstract art. It's like decoding a puzzle with infinite solutions. #AbstractArt",
            "The intricacy of Islamic geometric art is breathtaking. Each pattern tells a story. #GeometricArt",
            "Exploring the world through architectural photography – every building has its own character. #ArchitecturePhotography",
            "Why do you think art education is important in schools? Let’s discuss. #ArtEducation",
            "The blend of music and visual art in music videos can be extraordinary. Any favorites? 🎵#MusicAndArt",
            "Who else loves the art of film photography? The anticipation of waiting for photos to develop is unmatched. 🎞️#FilmPhotography",
            "Ceramics classes have shown me the raw beauty of creating something from a lump of clay. #Ceramics",
            "Exploring minimalist art – there's so much power in simplicity. What are your thoughts? #MinimalistArt",
            "Art festivals are my favorite way to discover new artists and styles. Anyone else love them? #ArtFestivals",
            "Creating art from recycled materials not only challenges creativity but also benefits the planet. #EcoArt",
            "The contrast and harmony between modern and classical art forms are always intriguing. #ArtContrast",
            "The emotional impact of performance art can be profound. Have you ever experienced a piece that moved you? #PerformanceArt",
            "Fashion as an art form is fascinating. How clothes can express so much about a person’s identity and mood. #FashionArt",
            "I’m mesmerized by underwater photography – it’s like a whole other world. #UnderwaterArt",
            "The evolution of graffiti from street vandalism to respected art form is remarkable. #GraffitiArt",
            "Exploring the rich history and cultural significance of African masks. #CulturalArt",
            "Art in public spaces can transform the environment and community's spirit. #PublicArt",
            "Discovering the art and science of landscape gardening – it’s like painting with plants! #GardenDesign",
            "Animation is a fascinating art form – from traditional cell animation to 3D modelling. #AnimationArt",
            "The tradition of storytelling through dance is powerful. #DanceArt",
            "Exploring the influence of art movements on contemporary design. #ArtMovements",
            "Macro photography opens up a world of detail that we usually overlook. #MacroPhotography",
            "Sketching daily has greatly improved my observation skills and attention to detail. #SketchingDaily",
            "Learning about the cultural significance behind different tattoo art traditions. #TattooArt",
            "The blend of literature and art in graphic novels creates a unique storytelling experience. #GraphicNovelsArt",
            "Creating mood boards is a great way to find inspiration for new art projects. #MoodBoards",
            "The craftsmanship behind handmade jewelry can tell a story as intricate as any painting. #JewelryArt",
            "Stained glass art has a way of playing with light and color that’s simply magical. #StainedGlassArt",
        ],
    }

    for i in range(num_posts):
        category = random.choice(categories)
        mixed_post = mix_posts(base_posts[category])
        data.append({"content": mixed_post, "category": category})

    df = pd.DataFrame(data)
    return df


if __name__ == "__main__":
    df = generate_mock_casts()
    df.to_csv("data/mock_casts.csv", index=False)
