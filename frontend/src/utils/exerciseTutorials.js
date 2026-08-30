/**
 * Comprehensive tutorial guides, video IDs, form instructions, pro tips, and anatomy details for exercises.
 */
export const EXERCISE_TUTORIALS = {
  // --- CHEST ---
  '1': {
    name: 'Bench Press',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Deltoids'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    youtubeId: 'rT7DgCr-3pg',
    overview: 'The king of upper body pressing exercises. Builds maximum pectoral mass, upper body pressing power, and shoulder stability.',
    setup: [
      'Lie flat on the bench with your eyes directly under the racked barbell.',
      'Plant your feet firmly on the floor with active leg drive.',
      'Grip the bar slightly wider than shoulder-width with a firm, thumbs-around grip.',
      'Retract and depress your scapulae (pinch shoulder blades together and tuck down into the bench).',
      'Unrack the barbell by straightening arms and bring it directly over your mid-chest.',
    ],
    execution: [
      'Inhale deeply and brace your core, expanding your diaphragm.',
      'Lower the barbell with control to your lower/mid chest (around nipple level) over 2–3 seconds.',
      'Keep your elbows tucked at roughly a 45–75 degree angle relative to your torso (avoid extreme 90° flare).',
      'Lightly touch the chest without bouncing or sinking into your ribcage.',
      'Drive the bar explosively upwards, pushing through the floor with your feet and exhaling near the lockout.',
    ],
    formTips: [
      'Maintain a slight natural arch in your lower back while keeping glutes in contact with the bench.',
      'Squeeze the bar aggressively to recruit more motor units and stabilize wrists.',
      'Think about bending the bar like a horseshoe to engage lats and stabilize your shoulder joint.',
    ],
    mistakesToAvoid: [
      'Bouncing the bar off your sternum (destroys kinetic momentum and risks injury).',
      'Flaring elbows out at 90 degrees, which places extreme shear force on the rotator cuff.',
      'Lifting your hips/glutes off the bench during heavy presses.',
    ],
    breathing: 'Inhale and brace before descending; hold during the bottom reversal; exhale forcefully on the upper half of the press.',
    tempo: '3-0-1-0 (3s eccentric, 0s pause, 1s explosive concentric, 0s reset)',
    targets: {
      strength: '4–6 sets of 3–5 reps (80–90% 1RM)',
      hypertrophy: '3–4 sets of 8–12 reps (70–80% 1RM)',
      endurance: '3 sets of 15+ reps (50–60% 1RM)',
    },
  },

  '2': {
    name: 'Incline Dumbbell Press',
    muscle: 'Chest',
    secondaryMuscles: ['Upper Clavicular Head', 'Front Deltoids', 'Triceps'],
    equipment: 'Dumbbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    youtubeId: '8iPEnn-ltC8',
    overview: 'Targets the upper chest (clavicular head) and allows greater natural range of motion and unilateral muscle balance than barbells.',
    setup: [
      'Set an adjustable bench to a 30° to 45° incline (too steep shifts focus to front shoulders).',
      'Sit back holding dumbbells on your thighs.',
      'Kick the dumbbells up with your knees one by one as you lean back onto the bench.',
      'Position the weights at upper chest level with wrists stacked directly over elbows.',
    ],
    execution: [
      'Retract your shoulder blades and brace your abs.',
      'Press the dumbbells upwards and slightly inwards in a smooth arc until arms are extended.',
      'Squeeze your upper chest at the top without banging the dumbbells together.',
      'Lower the dumbbells under full control until you feel a deep, comfortable stretch across the upper pectorals.',
    ],
    formTips: [
      'Keep your wrists neutral and don’t let the dumbbells tilt backwards.',
      'Keep your chest high and arched slightly forward throughout the movement.',
    ],
    mistakesToAvoid: [
      'Setting the bench incline too high (above 45° turns it into an overhead shoulder press).',
      'Shortening the range of motion by stopping halfway down.',
      'Letting the dumbbells collide at the top.',
    ],
    breathing: 'Inhale deeply as you lower the weights; exhale smoothly as you press upwards.',
    tempo: '2-1-1-0 (2s lowering, 1s stretch pause, 1s press)',
    targets: {
      strength: '3–4 sets of 6–8 reps',
      hypertrophy: '3–4 sets of 8–12 reps',
      endurance: '3 sets of 12–15 reps',
    },
  },

  '3': {
    name: 'Push-ups',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Deltoids', 'Core / Abs', 'Serratus Anterior'],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    mechanics: 'Compound',
    youtubeId: 'IODxDxX7oi4',
    overview: 'The fundamental calisthenics upper body movement. Promotes functional pressing strength, core stability, and scapular health.',
    setup: [
      'Get into a high plank position with hands positioned slightly wider than shoulder-width.',
      'Fingers pointed slightly forward or slightly flared outward for wrist comfort.',
      'Feet together or hip-width apart on your toes.',
      'Engage your glutes and brace your core so your body forms a straight, rigid line from heels to crown.',
    ],
    execution: [
      'Lower your chest towards the floor by breaking at the elbows and shoulders simultaneously.',
      'Keep your neck neutral looking a few inches in front of your hands.',
      'Lower until your chest is about an inch from the floor or lightly touches.',
      'Push the ground away through your palms to return to the starting plank position.',
    ],
    formTips: [
      'Do not allow your lower back to sag or hips to hike up.',
      'Keep your elbows tucked at ~45 degrees, never flared straight out at 90 degrees.',
    ],
    mistakesToAvoid: [
      'Sagging the pelvis, which hyperextends the lumbar spine.',
      'Leading with the head/neck instead of lowering the whole torso.',
      'Only performing half reps without reaching full chest depth.',
    ],
    breathing: 'Inhale on the way down; exhale as you push up.',
    tempo: '2-0-1-0',
    targets: {
      strength: 'Weighted / Deficit: 3 sets of 8–10 reps',
      hypertrophy: '3–4 sets of 12–20 reps',
      endurance: '3–4 sets to technical failure',
    },
  },

  '4': {
    name: 'Chest Fly',
    muscle: 'Chest',
    secondaryMuscles: ['Anterior Deltoids'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    mechanics: 'Isolation',
    youtubeId: 'eozdVDA78K0',
    overview: 'An isolation exercise emphasizing pectoral stretch and horizontal adduction without tricep involvement.',
    setup: [
      'Lie on a flat bench with a dumbbell in each hand, arms extended above chest with a slight elbow bend.',
      'Palms should face each other (neutral grip).',
      'Shoulder blades pulled back and pinned into the bench.',
    ],
    execution: [
      'In a wide arc, slowly open your arms out to the sides while keeping the elbow bend constant.',
      'Lower until your elbows are level with your bench and you feel a deep pectoral stretch.',
      'Engage your chest to bring the dumbbells back along the same arc to the starting point.',
      'Squeeze your inner pectorals firmly at the peak contraction.',
    ],
    formTips: [
      'Imagine hugging a large barrel throughout the movement to maintain the proper elbow angle.',
      'Do not turn the fly into a press by excessively bending and straightening your elbows.',
    ],
    mistakesToAvoid: [
      'Lowering the weights too deep, putting excessive strain on the anterior shoulder capsule.',
      'Using excessively heavy weights that compromise strict pectoral isolation.',
    ],
    breathing: 'Inhale as your arms open wide; exhale as you bring the weights together.',
    tempo: '3-1-1-1 (3s lowering, 1s stretch, 1s contraction, 1s squeeze)',
    targets: {
      hypertrophy: '3–4 sets of 10–15 reps',
      endurance: '3 sets of 15–20 reps',
    },
  },

  '5': {
    name: 'Dips',
    muscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Front Deltoids', 'Lower Chest'],
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    youtubeId: '2z8JmcrW-As',
    overview: 'Often referred to as the upper-body squat. Excellent for developing lower chest sweep, anterior shoulder strength, and triceps.',
    setup: [
      'Mount parallel dip bars with arms fully locked out and wrists straight.',
      'Cross your ankles and lean your torso forward at a ~30° angle for chest focus.',
      'Pull shoulders down away from your ears (scapular depression).',
    ],
    execution: [
      'Bend your elbows and lower your body while maintaining the forward torso lean.',
      'Lower until your upper arms are parallel to the floor or your elbows form a 90-degree angle.',
      'Push through your palms, extending the elbows to return to the top lockout.',
    ],
    formTips: [
      'Leaning forward emphasizes the chest; staying upright emphasizes the triceps.',
      'Keep your elbows from flaring excessively wide.',
    ],
    mistakesToAvoid: [
      'Dropping too deep beyond shoulder comfort and risking rotator cuff strain.',
      'Shrugging shoulders up toward ears during the descent.',
    ],
    breathing: 'Inhale descending; exhale driving upward.',
    tempo: '3-0-1-0',
    targets: {
      strength: 'Weighted: 4 sets of 6–8 reps',
      hypertrophy: '3–4 sets of 8–12 reps',
      endurance: '3 sets to failure',
    },
  },

  // --- BACK ---
  '6': {
    name: 'Pull-ups',
    muscle: 'Back',
    secondaryMuscles: ['Latissimus Dorsi', 'Biceps', 'Rhomboids', 'Forearms'],
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    mechanics: 'Compound',
    youtubeId: 'eGo4IYlbE5g',
    overview: 'The definitive bodyweight vertical pulling exercise for widening the lats and building a classic V-taper physique.',
    setup: [
      'Grip an overhead pull-up bar with an overhand (pronated) grip, slightly wider than shoulder width.',
      'Hang at full extension with active shoulders (avoid passive dead hanging during working sets).',
      'Engage your core and squeeze your legs together.',
    ],
    execution: [
      'Initiate the pull by driving your shoulder blades down and pulling your elbows down toward your hips.',
      'Pull your chest up toward the bar until your chin clears the bar comfortably.',
      'Pause for a split second at the top, contracting your lats.',
      'Lower yourself with complete control back to the starting hanging position.',
    ],
    formTips: [
      'Focus on driving elbows into your back pockets rather than pulling with your biceps.',
      'Keep your chest high and lead with the collarbone.',
    ],
    mistakesToAvoid: [
      'Kicking your legs or kipping to generate false momentum.',
      'Failing to reach full extension at the bottom (half reps).',
      'Craning your neck over the bar instead of pulling your chest up.',
    ],
    breathing: 'Exhale forcefully on the pull; inhale deeply on the descent.',
    tempo: '2-1-1-0',
    targets: {
      strength: 'Weighted: 4 sets of 4–6 reps',
      hypertrophy: '3–4 sets of 6–10 reps',
      endurance: '3 sets to failure',
    },
  },

  '7': {
    name: 'Barbell Row',
    muscle: 'Back',
    secondaryMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Rear Delts', 'Biceps', 'Lower Back'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    youtubeId: 'FWJR5Ve8gkQ',
    overview: 'Builds dense back thickness, rear delts, and posterior chain endurance through heavy horizontal pulling.',
    setup: [
      'Stand with feet shoulder-width apart, holding a loaded barbell with a pronated or underhand grip.',
      'Hinge at the hips until your torso is at approximately a 45° angle to the floor.',
      'Keep a soft bend in the knees, a flat spine, and arms hanging straight down.',
    ],
    execution: [
      'Brace your core and pull the barbell toward your lower ribs / belly button.',
      'Lead with your elbows and retract your scapulae firmly at the top of the pull.',
      'Hold the contraction for a moment, then lower the bar with control until arms are extended.',
    ],
    formTips: [
      'Do not bounce your torso up and down to swing heavy weight.',
      'Keep your neck aligned with your spine by looking at the floor a few feet ahead.',
    ],
    mistakesToAvoid: [
      'Rounding the lower back (greatly increases lumbar spine strain).',
      'Standing too upright (turns it into an upright shrug).',
    ],
    breathing: 'Inhale at bottom; hold brace and pull; exhale as you reach peak contraction.',
    tempo: '2-1-1-0',
    targets: {
      strength: '4 sets of 5–6 reps',
      hypertrophy: '3–4 sets of 8–12 reps',
    },
  },

  '8': {
    name: 'Lat Pulldown',
    muscle: 'Back',
    secondaryMuscles: ['Lats', 'Biceps', 'Middle Back'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    mechanics: 'Compound',
    youtubeId: 'CAwf7n6Luuc',
    overview: 'A staple machine exercise that simulates the pull-up pattern with customizable load for lat width development.',
    setup: [
      'Adjust the thigh pads so your legs fit snugly underneath with feet flat on the floor.',
      'Grip the wide bar with an overhand grip, slightly wider than shoulder-width.',
      'Sit down, lock your thighs under the pads, and lean back slightly (about 10–15°).',
    ],
    execution: [
      'Pull the bar down toward your upper chest by driving your elbows down and backward.',
      'Squeeze your lats hard as the bar reaches collarbone height.',
      'Slowly allow the bar to return overhead, getting a full stretch at the top.',
    ],
    formTips: [
      'Keep your chest proud and arched slightly upward toward the pulley.',
      'Do not lean excessively backward into a horizontal row.',
    ],
    mistakesToAvoid: [
      'Pulling the bar behind your neck (dangerous for cervical spine and rotator cuffs).',
      'Using momentum to yank the weight down.',
    ],
    breathing: 'Exhale pulling down; inhale returning up.',
    tempo: '2-1-1-0',
    targets: {
      hypertrophy: '3–4 sets of 10–12 reps',
      endurance: '3 sets of 15 reps',
    },
  },

  '9': {
    name: 'Seated Cable Row',
    muscle: 'Back',
    secondaryMuscles: ['Rhomboids', 'Mid Traps', 'Lats', 'Biceps'],
    equipment: 'Cable',
    difficulty: 'Beginner',
    mechanics: 'Compound',
    youtubeId: 'GZbfZ033f74',
    overview: 'Provides constant cable tension for strengthening the mid-back, rhomboids, and lower traps for improved posture.',
    setup: [
      'Sit on the bench with feet on the footrests and knees slightly bent.',
      'Reach forward to grab the V-bar attachment with a neutral grip.',
      'Push with your legs to sit upright with your torso perpendicular to the bench.',
    ],
    execution: [
      'Keep your chest high and pull the handle into your abdomen / belly button.',
      'Squeeze your shoulder blades together at the peak of the pull.',
      'Extend your arms forward under control, allowing a gentle stretch in the lats before the next rep.',
    ],
    formTips: [
      'Avoid swinging your torso excessively forward and backward.',
      'Keep shoulders down and avoid shrugging.',
    ],
    mistakesToAvoid: [
      'Rounding the lower back when reaching forward.',
      'Locking knees completely straight.',
    ],
    breathing: 'Exhale on the pull; inhale as you release the cable.',
    tempo: '2-1-1-0',
    targets: {
      hypertrophy: '3–4 sets of 10–12 reps',
      endurance: '3 sets of 15 reps',
    },
  },

  '10': {
    name: 'Deadlift',
    muscle: 'Back',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Lower Back', 'Traps', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Advanced',
    mechanics: 'Compound',
    youtubeId: 'op9kVnSso6Q',
    overview: 'The ultimate full-body test of raw strength. Engages nearly every muscle group in the posterior chain.',
    setup: [
      'Stand with feet hip-width apart, the barbell over your mid-foot (about an inch from your shins).',
      'Hinge at hips and grip the bar just outside your legs (double overhand or hook grip).',
      'Bring your shins forward to touch the bar without moving it.',
      'Lift your chest, pull slack out of the barbell, and engage your lats.',
    ],
    execution: [
      'Take a deep breath and brace your core tight.',
      'Push the floor away through your mid-foot and heels, extending hips and knees simultaneously.',
      'Keep the bar in contact with your legs throughout the ascent.',
      'Lock out at the top by squeezing glutes (do not hyperextend your lower back).',
      'Hinge hips back and lower the bar along your thighs back to the floor.',
    ],
    formTips: [
      'Think of the deadlift as pushing the earth away with your legs rather than pulling with your arms.',
      'Keep the bar as close to your center of gravity as possible.',
    ],
    mistakesToAvoid: [
      'Rounding the lumbar spine.',
      'Letting the barbell drift away from your body.',
      'Hyperextending the lower back at the top lockout.',
    ],
    breathing: 'Inhale and brace at the bottom; exhale past the sticking point or at lockout.',
    tempo: '1-0-1-0',
    targets: {
      strength: '3–5 sets of 3–5 reps',
      hypertrophy: '3 sets of 6–8 reps',
    },
  },

  // --- SHOULDERS ---
  '11': {
    name: 'Overhead Press',
    muscle: 'Shoulders',
    secondaryMuscles: ['Front Deltoids', 'Triceps', 'Upper Traps', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    youtubeId: '2yjwXTZQDDI',
    overview: 'The premier vertical pressing movement for developing broad, powerful shoulder caps and overhead stability.',
    setup: [
      'Set the bar at mid-chest height in a rack.',
      'Grip the barbell slightly wider than shoulder-width with wrists stacked over vertical forearms.',
      'Unrack the bar and step back; plant feet shoulder-width apart.',
      'Squeeze your glutes, lock your quads, and brace your core.',
    ],
    execution: [
      'Tilt your head back slightly to clear the bar’s path.',
      'Press the bar upward in a straight line close to your face.',
      'Once the bar passes your forehead, push your head forward into neutral position and lock out overhead.',
      'Lower the bar under control back to your clavicles.',
    ],
    formTips: [
      'Keep your core and glutes locked to prevent hyperextending your lumbar spine.',
      'Shrug your shoulders slightly at the top for safe scapular upward rotation.',
    ],
    mistakesToAvoid: [
      'Leaning back excessively to turn the lift into an incline press.',
      'Pressing the bar in a wide looping arc forward.',
    ],
    breathing: 'Inhale and brace before pressing; exhale at the top lockout.',
    tempo: '2-0-1-0',
    targets: {
      strength: '4–5 sets of 5 reps',
      hypertrophy: '3–4 sets of 8–10 reps',
    },
  },

  '12': {
    name: 'Lateral Raises',
    muscle: 'Shoulders',
    secondaryMuscles: ['Lateral Deltoids', 'Upper Traps'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    mechanics: 'Isolation',
    youtubeId: '3VcKaXpzqRo',
    overview: 'The gold standard exercise for isolating the lateral deltoid to achieve wide, round shoulders.',
    setup: [
      'Stand with feet hip-width apart holding light-to-moderate dumbbells at your sides.',
      'Hinge forward slightly at the hips (about 5–10°) and maintain a slight bend in your elbows.',
    ],
    execution: [
      'Raise the dumbbells out to your sides in the scapular plane (about 15–30° forward of pure sideways).',
      'Lead with your elbows and raise until weights reach shoulder height.',
      'Pause briefly at the peak, then lower smoothly over 2–3 seconds.',
    ],
    formTips: [
      'Think of pouring water from a pitcher or pushing the weights out toward the walls.',
      'Do not shrug your traps up toward your ears.',
    ],
    mistakesToAvoid: [
      'Swinging your body or using leg drive to heave the dumbbells up.',
      'Using weights that are too heavy, causing traps to take over.',
    ],
    breathing: 'Exhale raising; inhale lowering.',
    tempo: '2-1-1-1',
    targets: {
      hypertrophy: '3–4 sets of 12–15 reps',
      endurance: '3 sets of 15–20 reps',
    },
  },

  '13': {
    name: 'Face Pulls',
    muscle: 'Shoulders',
    secondaryMuscles: ['Rear Deltoids', 'Rotator Cuff', 'Rhomboids', 'Mid/Upper Traps'],
    equipment: 'Cable',
    difficulty: 'Beginner',
    mechanics: 'Compound',
    youtubeId: 'rep-qVOkqgk',
    overview: 'Crucial for shoulder health, external rotation strength, and correcting rounded-shoulder posture.',
    setup: [
      'Attach a rope to a cable pulley set at eye level or slightly higher.',
      'Grip the rope with a thumbs-backward (pronated or neutral) grip.',
      'Step back until arms are straight and tension is on the cable.',
    ],
    execution: [
      'Pull the center of the rope directly toward your face/forehead.',
      'Externally rotate your shoulders at the end so your hands are higher than your elbows in a double bicep pose.',
      'Squeeze rear delts and upper back for 1–2 seconds.',
      'Return slowly to the starting stretched position.',
    ],
    formTips: [
      'Focus on pulling the rope ends apart as you reach your face.',
      'Keep your neck relaxed and chest upright.',
    ],
    mistakesToAvoid: [
      'Using too much weight and leaning back with momentum.',
      'Failing to externally rotate at the end of the pull.',
    ],
    breathing: 'Exhale pulling to face; inhale returning.',
    tempo: '2-1-1-1',
    targets: {
      hypertrophy: '3–4 sets of 12–15 reps',
      shoulderHealth: '3 sets of 15–20 reps',
    },
  },

  '14': {
    name: 'Arnold Press',
    muscle: 'Shoulders',
    secondaryMuscles: ['Anterior Deltoids', 'Lateral Deltoids', 'Triceps'],
    equipment: 'Dumbbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    youtubeId: '6Z15_WdXmVw',
    overview: 'Created by Arnold Schwarzenegger, this rotational shoulder press activates all three heads of the deltoids across an extended range of motion.',
    setup: [
      'Sit on an upright bench with dumbbells held at chest level, palms facing your body (supinated).',
      'Keep your elbows tucked in close to your ribs.',
    ],
    execution: [
      'Press the dumbbells overhead while simultaneously rotating your wrists outward (pronating).',
      'At the top of the press, your palms should be facing forward.',
      'Reverse the rotational movement under control as you lower back to the starting chest position.',
    ],
    formTips: [
      'Make the rotation continuous and synchronized with the vertical press.',
    ],
    mistakesToAvoid: [
      'Rushing the rotation or banging the weights at the top.',
    ],
    breathing: 'Exhale on the rotating press; inhale lowering.',
    tempo: '2-0-1-0',
    targets: {
      hypertrophy: '3–4 sets of 8–12 reps',
    },
  },

  // --- ARMS (Biceps & Triceps) ---
  '15': {
    name: 'Bicep Curls',
    muscle: 'Biceps',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    mechanics: 'Isolation',
    youtubeId: 'ykJmrZ5v0Oo',
    overview: 'The fundamental isolation exercise for bicep peak development and elbow flexion strength.',
    setup: [
      'Stand tall with feet shoulder-width apart, holding a dumbbell in each hand at your sides.',
      'Shoulders back and core engaged.',
    ],
    execution: [
      'Keeping upper arms pinned at your sides, curl the weights upward toward your shoulders.',
      'Supinate your wrists (turn pinkies up) near the top for maximum peak contraction.',
      'Squeeze the biceps at the top, then lower with control over 2–3 seconds.',
    ],
    formTips: [
      'Do not swing your hips or elbows forward to cheat the weight up.',
    ],
    mistakesToAvoid: [
      'Using momentum or rocking backwards.',
      'Letting the elbows drift forward significantly.',
    ],
    breathing: 'Exhale curling; inhale lowering.',
    tempo: '2-1-1-1',
    targets: {
      hypertrophy: '3–4 sets of 10–12 reps',
    },
  },

  '16': {
    name: 'Hammer Curls',
    muscle: 'Biceps',
    secondaryMuscles: ['Brachioradialis', 'Brachialis', 'Forearms'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    mechanics: 'Isolation',
    youtubeId: 'zC3nLlEvin4',
    overview: 'Neutral grip curl emphasizing the brachialis and forearm flexors to add thickness to the upper arm.',
    setup: [
      'Hold dumbbells with palms facing each other (neutral grip).',
      'Stand upright with elbows at your sides.',
    ],
    execution: [
      'Curl the weights upward while maintaining the neutral hammer grip.',
      'Squeeze at the top of the contraction.',
      'Lower slowly to full arm extension.',
    ],
    formTips: [
      'Keep wrists straight and rigid throughout.',
    ],
    mistakesToAvoid: [
      'Swinging weights or flaring elbows outward.',
    ],
    breathing: 'Exhale lifting; inhale lowering.',
    tempo: '2-1-1-0',
    targets: {
      hypertrophy: '3–4 sets of 10–12 reps',
    },
  },

  '17': {
    name: 'Preacher Curls',
    muscle: 'Biceps',
    secondaryMuscles: ['Short Head Biceps', 'Brachialis'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    mechanics: 'Isolation',
    youtubeId: 'fIWP-FRFNU0',
    overview: 'Locks the upper arm in place on an angled pad to eliminate momentum and isolate the lower bicep.',
    setup: [
      'Adjust the seat so your armpits rest comfortably over the top edge of the pad.',
      'Grip the handles with an underhand grip, arms extended.',
    ],
    execution: [
      'Curl the handles upward toward your shoulders.',
      'Squeeze your biceps hard at peak contraction.',
      'Lower the weight with control until arms are almost fully straight (avoid harsh hyperextension).',
    ],
    formTips: [
      'Keep your chest against the support pad throughout.',
    ],
    mistakesToAvoid: [
      'Dropping the weight too fast and jarring the elbow joints.',
    ],
    breathing: 'Exhale curling; inhale lowering.',
    tempo: '2-1-1-0',
    targets: {
      hypertrophy: '3–4 sets of 10–12 reps',
    },
  },

  '18': {
    name: 'Tricep Pushdowns',
    muscle: 'Triceps',
    secondaryMuscles: ['Lateral & Medial Tricep Heads'],
    equipment: 'Cable',
    difficulty: 'Beginner',
    mechanics: 'Isolation',
    youtubeId: '2-LAMcpzODU',
    overview: 'Essential cable isolation for tricep lockout strength and lateral head horseshoe definition.',
    setup: [
      'Attach a straight bar or rope to a high pulley.',
      'Stand close with a slight forward lean at the hips.',
      'Tuck elbows tight against your ribs.',
    ],
    execution: [
      'Push the attachment down by extending your elbows until arms are fully locked out.',
      'If using a rope, flare the ends apart at the bottom for an extra contraction.',
      'Allow forearms to rise back up to 90 degrees while keeping elbows pinned in place.',
    ],
    formTips: [
      'Do not let your elbows drift forward or flare out during the rep.',
    ],
    mistakesToAvoid: [
      'Using your body weight to push down the bar.',
    ],
    breathing: 'Exhale pushing down; inhale returning up.',
    tempo: '2-1-1-0',
    targets: {
      hypertrophy: '3–4 sets of 12–15 reps',
    },
  },

  '19': {
    name: 'Overhead Tricep Extension',
    muscle: 'Triceps',
    secondaryMuscles: ['Long Head Triceps'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    mechanics: 'Isolation',
    youtubeId: '_gsUokN_Mgg',
    overview: 'Places the long head of the triceps on a full stretch for maximum muscle hypertrophy.',
    setup: [
      'Sit on a bench with back support holding a dumbbell overhead with both hands forming a diamond under the weight plate.',
      'Extend arms fully overhead with elbows pointing forward.',
    ],
    execution: [
      'Lower the dumbbell behind your head by bending at the elbows while keeping upper arms vertical.',
      'Lower until you feel a deep stretch in the triceps.',
      'Extend elbows to press the weight back overhead.',
    ],
    formTips: [
      'Keep your elbows pointed forward and as close together as comfortably possible.',
    ],
    mistakesToAvoid: [
      'Flaring elbows excessively wide.',
      'Arching your lower back.',
    ],
    breathing: 'Inhale lowering behind head; exhale pressing overhead.',
    tempo: '2-1-1-0',
    targets: {
      hypertrophy: '3–4 sets of 10–12 reps',
    },
  },

  '20': {
    name: 'Close-Grip Bench Press',
    muscle: 'Triceps',
    secondaryMuscles: ['Chest', 'Front Deltoids'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    youtubeId: 'nEF0bv2FW94',
    overview: 'Heavy compound pressing variant designed to overload the triceps with maximum weight.',
    setup: [
      'Lie on a bench and grip the barbell shoulder-width apart (hands ~12–14 inches apart).',
      'Do not grip excessively close as it places undue strain on wrists.',
    ],
    execution: [
      'Unrack the bar and lower it to your lower sternum with elbows tucked tightly against your ribs.',
      'Press the bar explosively back to lockout, engaging the triceps.',
    ],
    formTips: [
      'Keep elbows tracking close to your torso on the descent.',
    ],
    mistakesToAvoid: [
      'Griping the bar with hands touching (wrecks wrists and reduces force production).',
    ],
    breathing: 'Inhale lowering; exhale pressing up.',
    tempo: '2-0-1-0',
    targets: {
      strength: '4 sets of 6–8 reps',
      hypertrophy: '3–4 sets of 8–10 reps',
    },
  },

  // --- LEGS & GLUTES ---
  '21': {
    name: 'Squat',
    muscle: 'Legs',
    secondaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core', 'Lower Back'],
    equipment: 'Barbell',
    difficulty: 'Advanced',
    mechanics: 'Compound',
    youtubeId: 'ultWZbUMPL8',
    overview: 'The fundamental lower-body movement for total quad mass, glute development, and functional athletic power.',
    setup: [
      'Set the bar in the rack at collarbone height.',
      'Step under the bar and rest it across your upper traps (high bar) or rear delts (low bar).',
      'Unrack with feet shoulder-width apart, toes pointed slightly outward (15–30°).',
      'Take a deep belly breath and brace your core 360 degrees.',
    ],
    execution: [
      'Initiate the squat by breaking at the hips and knees simultaneously.',
      'Push your knees outward in line with your toes as you descend.',
      'Squat down until thighs are at least parallel to the floor (hip crease below top of knee).',
      'Drive through your mid-foot/heels to stand back up powerfully.',
    ],
    formTips: [
      'Keep your chest high and maintain a neutral spine throughout.',
      'Root your feet firmly into the floor (three-point contact: big toe, pinky toe, heel).',
    ],
    mistakesToAvoid: [
      'Allowing knees to cave inward (valgus collapse).',
      'Letting heels lift off the ground.',
      'Rounding the lower back in the hole (butt wink).',
    ],
    breathing: 'Inhale and brace at the top; descend and hold; exhale forcefully on the way up.',
    tempo: '3-0-1-0',
    targets: {
      strength: '4–5 sets of 3–5 reps',
      hypertrophy: '3–4 sets of 8–12 reps',
    },
  },

  '22': {
    name: 'Leg Press',
    muscle: 'Legs',
    secondaryMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    mechanics: 'Compound',
    youtubeId: 'IZxyjW7MPJQ',
    overview: 'Allows massive quad and leg loading without taxing the lower back or core stability.',
    setup: [
      'Sit on the machine with your back and head resting against the padded support.',
      'Place feet shoulder-width apart in the center of the sled platform.',
      'Disengage the safety levers and extend legs (avoid harsh knee lockout).',
    ],
    execution: [
      'Lower the platform slowly by bending your knees until they reach roughly a 90-degree angle.',
      'Press through the entire foot to drive the platform back up to starting position.',
    ],
    formTips: [
      'High foot placement shifts focus to glutes and hamstrings; lower placement shifts focus to quads.',
      'Keep your lower back and tailbone glued to the seat pad.',
    ],
    mistakesToAvoid: [
      'Letting your pelvis curl off the pad at the bottom of the movement.',
      'Hyperextending and violently locking your knees at the top.',
    ],
    breathing: 'Inhale lowering; exhale pressing.',
    tempo: '2-1-1-0',
    targets: {
      hypertrophy: '3–4 sets of 10–15 reps',
    },
  },

  '23': {
    name: 'Romanian Deadlift',
    muscle: 'Legs',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Lower Back', 'Forearms'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    youtubeId: 'JCXUYuzwNrM',
    overview: 'The premier hip-hinge exercise for lengthening and developing hamstring hypertrophy and strong glutes.',
    setup: [
      'Hold a barbell at hip level with a shoulder-width overhand grip.',
      'Stand with feet hip-width apart and knees softly unlocked.',
      'Keep shoulder blades pulled back and core braced.',
    ],
    execution: [
      'Push your hips backward as if trying to touch a wall behind you.',
      'Slide the bar closely down your thighs and shins while keeping your back completely flat.',
      'Stop when you feel a deep, intense stretch in your hamstrings (usually mid-shin).',
      'Drive your hips forward and squeeze your glutes to return to standing.',
    ],
    formTips: [
      'This is a pure hip hinge, NOT a squat—knee angle should remain relatively fixed.',
      'Keep the bar gliding against your legs the entire time.',
    ],
    mistakesToAvoid: [
      'Bending the knees too much and turning it into a regular deadlift.',
      'Rounding the lower back to reach lower to the floor.',
    ],
    breathing: 'Inhale hinging down; exhale squeezing hips forward.',
    tempo: '3-1-1-0',
    targets: {
      hypertrophy: '3–4 sets of 8–12 reps',
    },
  },

  '24': {
    name: 'Lunges',
    muscle: 'Legs',
    secondaryMuscles: ['Quadriceps', 'Glutes', 'Calves', 'Core Balance'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    mechanics: 'Compound',
    youtubeId: 'QOVaHwm-Q6U',
    overview: 'Unilateral leg builder that addresses strength imbalances, increases knee stability, and builds athletic leg power.',
    setup: [
      'Stand upright holding dumbbells at your sides.',
      'Take a comfortable, controlled step forward with one leg.',
    ],
    execution: [
      'Lower your hips until both knees are bent at roughly 90-degree angles.',
      'Your back knee should hover just above the floor without slamming.',
      'Push firmly through the front heel to step back to the starting position.',
    ],
    formTips: [
      'Keep your torso upright and front knee tracking over your second toe.',
    ],
    mistakesToAvoid: [
      'Letting the front knee collapse inward or tracking excessively far past the toes.',
    ],
    breathing: 'Inhale descending; exhale driving up.',
    tempo: '2-0-1-0',
    targets: {
      hypertrophy: '3 sets of 10–12 reps per leg',
    },
  },

  '25': {
    name: 'Leg Curls',
    muscle: 'Legs',
    secondaryMuscles: ['Hamstrings', 'Calves'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    mechanics: 'Isolation',
    youtubeId: '1Tq3QdYUuHs',
    overview: 'Direct knee-flexion isolation exercise for complete hamstring development and knee joint protection.',
    setup: [
      'Lie face down on the prone leg curl machine or sit in the seated curl machine.',
      'Position the padded lever behind your lower calves (just below the calf muscle, above the Achilles).',
      'Hold the support handles for upper-body stability.',
    ],
    execution: [
      'Curl your legs upward toward your glutes as far as possible.',
      'Hold the peak contraction for 1 second.',
      'Lower the weight smoothly under full eccentric control.',
    ],
    formTips: [
      'Point your toes toward your shins (dorsiflexion) to maximize hamstring tension.',
    ],
    mistakesToAvoid: [
      'Lifting your hips off the pad during the curl.',
    ],
    breathing: 'Exhale curling; inhale lowering.',
    tempo: '2-1-1-0',
    targets: {
      hypertrophy: '3–4 sets of 10–15 reps',
    },
  },

  '26': {
    name: 'Hip Thrust',
    muscle: 'Glutes',
    secondaryMuscles: ['Hamstrings', 'Quads', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    mechanics: 'Compound',
    youtubeId: 'SEdqd1n0cvg',
    overview: 'The highest EMG muscle activation exercise for building maximum glute strength, size, and sprinting power.',
    setup: [
      'Sit on the floor with your upper back supported against a bench (bench edge right below shoulder blades).',
      'Roll a padded barbell over your hips.',
      'Place feet flat on the floor, shoulder-width apart, with shins vertical at top extension.',
    ],
    execution: [
      'Drive through your heels to raise your hips until your thighs and torso are in a straight line.',
      'Tuck your chin slightly and look forward, squeezing your glutes as hard as possible at the top.',
      'Lower hips back down with control.',
    ],
    formTips: [
      'Do not hyperextend your lumbar spine at the top—squeeze glutes to reach lockout.',
    ],
    mistakesToAvoid: [
      'Looking up at the ceiling and arching your lower back.',
    ],
    breathing: 'Exhale thrusting upward; inhale lowering down.',
    tempo: '2-1-1-1',
    targets: {
      hypertrophy: '3–4 sets of 8–12 reps',
      strength: '4 sets of 6–8 reps',
    },
  },

  '27': {
    name: 'Glute Bridge',
    muscle: 'Glutes',
    secondaryMuscles: ['Hamstrings', 'Core'],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    mechanics: 'Isolation',
    youtubeId: 'wPM8icPu6H8',
    overview: 'A beginner-friendly glute activation exercise ideal for warm-ups, posture restoration, and glute isolation.',
    setup: [
      'Lie flat on your back with knees bent and feet flat on the floor, hip-width apart.',
      'Arms flat along your sides on the floor.',
    ],
    execution: [
      'Drive through your heels to lift your hips toward the ceiling.',
      'Squeeze your glutes tightly at the top for 1–2 seconds.',
      'Lower your hips back to the floor smoothly.',
    ],
    formTips: [
      'Focus on pushing through your heels, not your toes.',
    ],
    mistakesToAvoid: [
      'Pushing through the lower back instead of contracting the glutes.',
    ],
    breathing: 'Exhale lifting; inhale lowering.',
    tempo: '2-2-1-0',
    targets: {
      hypertrophy: '3 sets of 15–20 reps',
    },
  },

  // --- ABS & CORE ---
  '28': {
    name: 'Plank',
    muscle: 'Abs',
    secondaryMuscles: ['Transverse Abdominis', 'Obliques', 'Shoulders', 'Glutes'],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    mechanics: 'Isometric',
    youtubeId: 'pSHjTRCQxIw',
    overview: 'Isometric core builder that reinforces spinal stability, abdominal endurance, and anti-extension strength.',
    setup: [
      'Place forearms on the floor with elbows directly under shoulders.',
      'Extend legs straight behind you, resting on the balls of your feet.',
      'Form a straight, unbreakable line from your head to your heels.',
    ],
    execution: [
      'Actively pull your belly button toward your spine and squeeze your glutes and quads.',
      'Hold the position without letting your hips sag or rise.',
      'Breathe steadily into your diaphragm throughout the hold.',
    ],
    formTips: [
      'Do not hold your breath; take rhythmic, shallow breaths while maintaining core tension.',
    ],
    mistakesToAvoid: [
      'Sagging hips (strains lower back) or piking hips into a triangle.',
    ],
    breathing: 'Steady rhythmic breathing while keeping core braced.',
    tempo: 'Isometric hold (30–60 seconds per set)',
    targets: {
      endurance: '3 sets of 30–60s hold',
    },
  },

  '29': {
    name: 'Hanging Leg Raises',
    muscle: 'Abs',
    secondaryMuscles: ['Lower Abs', 'Hip Flexors', 'Forearms / Grip'],
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    mechanics: 'Compound',
    youtubeId: 'hdng3Nm1x_E',
    overview: 'Targets the lower abdominal fibers and hip flexors through dynamic spinal flexion while hanging.',
    setup: [
      'Hang from an overhead pull-up bar with an overhand grip, arms fully extended.',
      'Engage shoulders and keep legs together.',
    ],
    execution: [
      'Without swinging, raise your straight legs (or knees for beginners) up until thighs are at least parallel to the floor.',
      'Tilt your pelvis backward at the top to fully contract the lower abs.',
      'Lower legs slowly with complete control to prevent swinging.',
    ],
    formTips: [
      'Focus on curling your pelvis upward, not just swinging your legs with hip flexors.',
    ],
    mistakesToAvoid: [
      'Using momentum to swing back and forth.',
    ],
    breathing: 'Exhale raising legs; inhale lowering down.',
    tempo: '2-1-1-0',
    targets: {
      hypertrophy: '3–4 sets of 10–15 reps',
    },
  },

  '30': {
    name: 'Cable Crunches',
    muscle: 'Abs',
    secondaryMuscles: ['Rectus Abdominis', 'Obliques'],
    equipment: 'Cable',
    difficulty: 'Beginner',
    mechanics: 'Isolation',
    youtubeId: '2fORO4vfZyo',
    overview: 'Allows progressive overload on the six-pack abdominal muscles through weighted spinal flexion.',
    setup: [
      'Attach a rope to a high cable pulley and kneel about 2 feet in front of the stack.',
      'Hold the rope ends alongside your ears/temples.',
      'Hips should be high and locked in place.',
    ],
    execution: [
      'Flex your spine and curl your torso downward, bringing your elbows toward your knees.',
      'Squeeze your abs intensely at the bottom.',
      'Slowly uncurl and return to the starting position while keeping constant tension on the abs.',
    ],
    formTips: [
      'Do not sit back onto your heels—the movement must come from curling your spine.',
    ],
    mistakesToAvoid: [
      'Using your arms to pull the rope down instead of crunching with your abs.',
    ],
    breathing: 'Exhale as you crunch down; inhale returning up.',
    tempo: '2-1-1-0',
    targets: {
      hypertrophy: '3–4 sets of 12–15 reps',
    },
  },
};
