
    // --- GAME SETUP ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const uiTimer = document.getElementById('timer-display');
    const uiLevel = document.getElementById('level-display');
    const centerMsg = document.getElementById('center-message');
    const titleText = document.getElementById('title-text');
    const descText = document.getElementById('desc-text');
    const btnContainer = document.getElementById('button-container');
    const container = document.getElementById('crt-container');
    const monologueBox = document.getElementById('monologue-box');

    // Constants
    const INTRO_TEXT = `Meet <strong>Alex</strong>. He suffers from severe social anxiety.<br>
                    To him, a simple "Hello" is a boss battle.<br>
                    <br>
                    Tap the <span style="color:#ef4444">RED THREATS</span> to avoid awkward eye contact.<br>
                    Don't let your social battery run out!`;

    // Game State
    let gameState = 'MENU'; 
    let lastTime = 0;
    let timer = 20;
    let maxTime = 12; 
    let currentLevel = 1;
    let maxLevels = 5; 
    let globalShake = 0;
    
    // Logic State
    let levelThoughts = [];
    let thoughtTimer = 0;
    let currentThoughtIndex = 0;
    let level1Crowd = []; 

    // Entities
    const player = { x: 400, y: 300, size: 50, sweat: 0, blinkTimer: 0 }; 
    let threats = []; 
    let particles = []; 
    let floatingTexts = [];

    // --- HARDCODED CONTENT FUNCTIONS ---

    function generateLevelThoughts(levelIndex) {
        // Hardcoded thoughts for each level
        switch(levelIndex) {
            case 1: // Paparazzi
                levelThoughts = ["Don't trip.", "Is that a camera?", "Walk faster!", "My hair looks bad.", "Don't look back.", "Why are they yelling?"];
                break;
            case 2: // Teens
                levelThoughts = ["Are they laughing?", "Don't make eye contact.", "My outfit is weird.", "Just keep walking.", "They are judging me.", "Too loud..."];
                break;
            case 3: // Salesmen
                levelThoughts = ["Go away!", "I'm not home.", "Don't open it.", "Is he gone?", "Why me?", "Stay quiet.", "Pretend I'm asleep."];
                break;
            case 4: // Shoppers
                levelThoughts = ["Too many people.", "Excuse me...", "Just grab and go.", "Where is the list?", "Can they see me?", "Move, please."];
                break;
            case 5: // Void
                levelThoughts = ["Is this real?", "I'm fading.", "Where is the exit?", "Nothing matters.", "Hello?", "Am I invisible?"];
                break;
            default:
                levelThoughts = ["I want to go home.", "Are they looking?", "Act normal.", "My hands are sweating.", "Panic rising."];
        }
    }

    // --- GAME LOGIC ---

    function gameLoop(timestamp) {
        let deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        if (gameState === 'PLAYING') {
            update(deltaTime);
        } else if (gameState === 'MENU' || gameState === 'WIN' || gameState === 'LOSE') {
            drawEnvironment(ctx, currentLevel);
            drawPlayer(ctx, player.x, player.y, 0, null);
        }
        
        if (gameState === 'PLAYING' || gameState === 'RELIEF') {
            draw();
        }
        
        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        centerMsg.style.display = 'none';
        currentLevel = 1;
        startLevel(currentLevel);
    }

    function nextLevel() {
        currentLevel++;
        startLevel(currentLevel);
    }

    function exitToMenu() {
        gameState = 'MENU';
        centerMsg.style.display = 'block';
        monologueBox.style.opacity = 0;
        
        titleText.innerText = "ANXIOUS ANTIC";
        titleText.style.color = "#60a5fa";
        titleText.style.textShadow = "4px 4px 0 #1e3a8a";
        
        descText.innerHTML = INTRO_TEXT;
        
        btnContainer.innerHTML = `<button onclick="startGame()">START GAME</button>`;
        
        // Reset Level 1 visuals for background
        currentLevel = 1;
        level1Crowd = [];
        for(let i=0; i<40; i++) {
            level1Crowd.push({
                x: Math.random() < 0.5 ? Math.random() * 180 : 620 + Math.random() * 180,
                y: 100 + Math.random() * 500,
                style: Math.floor(Math.random() * 4),
                color: ['#f1c40f', '#e67e22', '#8e44ad', '#95a5a6'][Math.floor(Math.random()*4)]
            });
        }
    }

    function startLevel(level) {
        gameState = 'PLAYING';
        timer = 12.0; 
        maxTime = 12.0;
        player.sweat = 0;
        player.x = 400; player.y = 300;
        threats = [];
        particles = [];
        floatingTexts = [];
        level1Crowd = []; 
        container.classList.remove('shake-screen');
        
        // UI Resets
        centerMsg.style.display = 'none'; // HIDE MENU
        monologueBox.style.opacity = 0;
        
        showMonologue("Oh no, everyone's looking...");
        currentThoughtIndex = 0;
        thoughtTimer = 0;
        
        generateLevelThoughts(level);

        switch(level) {
            case 1:
                uiLevel.textContent = "LVL 1: THE PAPARAZZI";
                // Slow speed 15 (300px/20s)
                spawnThreat(100, 300, 'chase', 15, 'camera'); 
                spawnThreat(700, 300, 'chase', 15, 'camera'); 
                
                level1Crowd = [];
                for(let i=0; i<40; i++) {
                    level1Crowd.push({
                        x: Math.random() < 0.5 ? Math.random() * 180 : 620 + Math.random() * 180,
                        y: 100 + Math.random() * 500,
                        style: Math.floor(Math.random() * 4),
                        color: ['#f1c40f', '#e67e22', '#8e44ad', '#95a5a6'][Math.floor(Math.random()*4)]
                    });
                }
                break;
            case 2:
                uiLevel.textContent = "LVL 2: COOL TEENS";
                spawnThreat(150, 150, 'static', 0, 'teen');
                spawnThreat(650, 150, 'static', 0, 'teen');
                spawnThreat(400, 500, 'static', 0, 'teen');
                spawnThreat(400, 100, 'static', 0, 'teen'); 
                break;
            case 3:
                uiLevel.textContent = "LVL 3: DOOR-TO-DOOR";
                // Hesitant speed 40 roughly averages to 15 effective speed
                spawnThreat(100, 300, 'hesitant', 40, 'suit');
                break;
            case 4:
                uiLevel.textContent = "LVL 4: THE HOVERER";
                spawnThreat(200, 300, 'orbit', 2, 'base'); 
                break;
            case 5:
                uiLevel.textContent = "LVL 5: DISSOCIATION";
                spawnThreat(100, 100, 'teleport', 1.5, 'void'); 
                break;
        }
        
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    function spawnThreat(x, y, aiType, speed, spriteType) {
        threats.push({
            x: x, y: y,
            radius: 40, aiType: aiType, spriteType: spriteType, speed: speed,
            active: true, angle: 0, timer: 0, scale: 1, blinkTimer: Math.random() * 2,
            hairStyle: Math.floor(Math.random() * 3), 
            hairColor: ['#e67e22', '#f1c40f', '#8e44ad', '#2c3e50'][Math.floor(Math.random() * 4)]
        });
    }

    function spawnFloatingText(x, y, text, color) {
        floatingTexts.push({x, y, text, color, life: 1.5, vy: -50});
    }

    function showMonologue(text) {
        monologueBox.textContent = text;
        monologueBox.style.opacity = 1;
        setTimeout(() => { monologueBox.style.opacity = 0; }, 3500);
    }

    function update(dt) {
        timer -= dt;
        if (timer <= 0) { gameOver("SOCIAL BATTERY DEPLETED"); return; }
        
        thoughtTimer += dt;
        if (thoughtTimer > 4.5) {
            thoughtTimer = 0;
            if (levelThoughts.length > 0) {
                showMonologue(levelThoughts[currentThoughtIndex]);
                currentThoughtIndex = (currentThoughtIndex + 1) % levelThoughts.length;
            }
        }

        let batteryPct = Math.floor((timer / maxTime) * 100);
        if (batteryPct > 100) batteryPct = 100;
        uiTimer.textContent = `SOCIAL BATTERY: ${batteryPct}%`;
        
        if (batteryPct < 30) {
            uiTimer.classList.add('anxiety-high'); uiTimer.classList.remove('anxiety-meter'); globalShake = 2;
        } else {
            uiTimer.classList.add('anxiety-meter'); uiTimer.classList.remove('anxiety-high'); globalShake = 0;
        }

        player.sweat += dt * 0.5;
        player.blinkTimer -= dt;
        if(player.blinkTimer < 0) player.blinkTimer = Math.random() * 4 + 1;
        
        let activeThreats = 0;
        let nearestThreat = null;
        let minDist = Infinity;

        threats.forEach(t => {
            if (!t.active) return;
            activeThreats++;
            t.timer += dt; t.blinkTimer += dt;

            let dx = t.x - player.x; let dy = t.y - player.y; let d = Math.sqrt(dx*dx+dy*dy);
            if(d < minDist) { minDist = d; nearestThreat = t; }

            if (t.aiType === 'chase') moveTowardsPlayer(t, t.speed, dt);
            else if (t.aiType === 'static') {
                t.scale = 1 + Math.sin(t.timer * 4) * 0.05;
                if (t.spriteType === 'teen' && Math.random() < 0.02) spawnFloatingText(t.x, t.y - 40, Math.random() > 0.5 ? "LOL" : "HAHA", "#ffeb3b");
            } 
            else if (t.aiType === 'zigzag') {
                t.angle += dt * 5; t.x += t.speed * dt; t.y += Math.sin(t.angle) * 8; 
                if (t.x > canvas.width - 50 || t.x < 50) t.speed *= -1;
            }
            else if (t.aiType === 'hesitant') {
                let moveFactor = Math.sin(t.timer * 3); 
                if (moveFactor > 0.3) moveTowardsPlayer(t, t.speed, dt);
            }
            else if (t.aiType === 'orbit') {
                t.angle += t.speed * dt; t.x = player.x + Math.cos(t.angle) * 180; t.y = player.y + Math.sin(t.angle) * 180;
            }
            else if (t.aiType === 'teleport') {
                if (t.timer > t.speed) {
                    t.timer = 0; spawnParticles(t.x, t.y, '#a855f7', 10); 
                    t.x = Math.random() * (canvas.width - 150) + 75; t.y = Math.random() * (canvas.height - 150) + 75;
                    spawnParticles(t.x, t.y, '#a855f7', 10); 
                }
            }

            if (t.aiType !== 'static' && t.aiType !== 'teleport') {
                if (d < 50 + t.radius) gameOver("FORCED INTERACTION!");
            }
        });

        player.nearestThreat = nearestThreat;
        if (activeThreats === 0) levelComplete();

        particles.forEach((p, index) => {
            p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; 
            if(p.life <= 0) particles.splice(index, 1);
        });

        floatingTexts.forEach((ft, index) => {
            ft.life -= dt; ft.y += ft.vy * dt;
            if(ft.life <= 0) floatingTexts.splice(index, 1);
        });
    }

    function moveTowardsPlayer(t, speed, dt) {
        let dx = player.x - t.x; let dy = player.y - t.y; let dist = Math.sqrt(dx*dx + dy*dy);
        if(dist > 10) { t.x += (dx/dist) * speed * dt; t.y += (dy/dist) * speed * dt; }
    }

    // --- VISUALS & DRAWING ---

    function drawEnvironment(ctx, level) {
        ctx.fillStyle = '#111'; ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (level === 1) {
            // LVL 1: RED CARPET
            ctx.fillStyle = '#2c3e50'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Crowd
            level1Crowd.forEach(member => {
                drawCrowdMember(ctx, member.x, member.y, member.style, member.color);
                if (Math.random() > 0.99) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.beginPath(); ctx.arc(member.x, member.y - 10, 20, 0, Math.PI*2); ctx.fill();
                }
            });

            // Street Lights Background
            drawStreetLight(ctx, 100, 100); drawStreetLight(ctx, 700, 100);

            ctx.fillStyle = '#000'; ctx.fillRect(0, 450, 100, 150); // Limo
            ctx.fillStyle = '#555'; ctx.fillRect(20, 450, 5, 150); 
            ctx.fillStyle = '#222'; ctx.fillRect(0, 470, 20, 50); 

            ctx.fillStyle = '#922b21'; ctx.fillRect(200, 100, 400, 500); 
            ctx.strokeStyle = '#7b241c'; ctx.lineWidth = 2;
            for(let i=120; i<600; i+=40) { ctx.beginPath(); ctx.moveTo(200, i); ctx.lineTo(600, i); ctx.stroke(); }
            
            for(let i=0; i<20; i++) {
                ctx.fillStyle = ['#f1c40f', '#e74c3c', '#ecf0f1'][Math.floor(Math.random()*3)];
                ctx.fillRect(200 + Math.random()*400, 100 + Math.random()*500, 5, 5);
            }

            ctx.fillStyle = '#34495e'; ctx.fillRect(0, 0, canvas.width, 100);
            ctx.fillStyle = '#5d4037'; ctx.fillRect(350, 20, 100, 80); 
            ctx.fillStyle = '#e67e22'; ctx.fillRect(395, 50, 10, 20); 

            let awningY = 80;
            for(let i=200; i<600; i+=40) {
                ctx.fillStyle = (i % 80 === 0) ? '#c0392b' : '#f1c40f'; 
                ctx.fillRect(i, awningY - 20, 40, 40);
            }

            ctx.fillStyle = '#f39c12'; ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 8;
            for(let y=150; y<650; y+=100) {
                ctx.beginPath(); ctx.arc(190, y, 12, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(610, y, 12, 0, Math.PI*2); ctx.fill();
                if(y < 550) {
                     ctx.beginPath(); ctx.moveTo(190, y); ctx.quadraticCurveTo(210, y + 50, 190, y + 100); ctx.stroke();
                     ctx.beginPath(); ctx.moveTo(610, y); ctx.quadraticCurveTo(590, y + 50, 610, y + 100); ctx.stroke();
                }
            }
            // Bottom barrier framing
            ctx.fillStyle = '#000'; ctx.fillRect(0, 580, 800, 20);
        } 
        else if (level === 2) {
            // LVL 2: MALL
            let grad = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
            grad.addColorStop(0, '#dcdde1'); grad.addColorStop(1, '#bdc3c7');
            ctx.fillStyle = grad; ctx.fillRect(0,0,canvas.width, canvas.height);
            
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            for(let x=0; x<canvas.width; x+=100) {
                for(let y=0; y<canvas.height; y+=100) ctx.fillRect(x+10, y+10, 80, 80);
            }

            ctx.fillStyle = '#2f3640'; ctx.fillRect(0, 0, canvas.width, 120);
            ctx.fillStyle = '#dcdde1'; ctx.fillRect(20, 20, 250, 100); 
            ctx.fillStyle = '#7f8c8d'; ctx.fillRect(50, 40, 20, 60); ctx.beginPath(); ctx.arc(60, 35, 8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#e74c3c'; ctx.font = '20px Arial'; ctx.fillText("SALE 50%", 180, 70);
            ctx.fillStyle = '#dcdde1'; ctx.fillRect(530, 20, 250, 100); 
            ctx.fillStyle = '#7f8c8d'; ctx.fillRect(600, 40, 20, 60); ctx.beginPath(); ctx.arc(610, 35, 8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#0984e3'; ctx.font = '20px Arial'; ctx.fillText("FASHION", 680, 70);

            // Coffee Kiosk
            ctx.fillStyle = '#6d4c41'; ctx.fillRect(50, 250, 80, 60);
            ctx.fillStyle = '#d7ccc8'; ctx.fillRect(50, 250, 80, 20);
            ctx.fillStyle = '#3e2723'; ctx.fillText("COFFEE", 55, 290);
            // Barista
            ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.arc(90, 240, 10, 0, Math.PI*2); ctx.fill();

            ctx.fillStyle = '#bdc3c7'; ctx.beginPath(); ctx.arc(400, 350, 110, 0, Math.PI*2); ctx.fill(); 
            ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.arc(400, 350, 90, 0, Math.PI*2); ctx.fill(); 
            ctx.fillStyle = '#f1c40f'; for(let i=0;i<5;i++) ctx.fillRect(400+(Math.random()-0.5)*100, 350+(Math.random()-0.5)*100, 4, 4);
            drawIndoorPlant(ctx, 200, 500); drawIndoorPlant(ctx, 600, 500);
            drawMallBench(ctx, 100, 400); drawMallBench(ctx, 700, 400);
            
            // Trash Cans
            drawTrashCan(ctx, 150, 400); drawTrashCan(ctx, 650, 400);

            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.beginPath(); ctx.moveTo(200, 0); ctx.lineTo(300, 0); ctx.lineTo(100, 600); ctx.lineTo(0, 600); ctx.fill();
        }
        else if (level === 3) {
            // LVL 3: PORCH
            ctx.fillStyle = '#95a5a6'; ctx.fillRect(0, 0, canvas.width, canvas.height); 
            ctx.fillStyle = '#7f8c8d'; for(let y=200; y<600; y+=40) ctx.fillRect(300, y, 200, 35);
            ctx.fillStyle = '#27ae60'; ctx.fillRect(0,0,100,600); ctx.fillRect(700,0,100,600);
            
            // Big Tree on Left
            drawBigTree(ctx, 50, 200);

            ctx.fillStyle = '#c0392b'; ctx.fillRect(100, 0, 600, 200);
            ctx.fillStyle = '#a93226'; for(let x=100; x<700; x+=30) for(let y=0; y<200; y+=15) ctx.fillRect(x, y, 25, 10);

            ctx.fillStyle = '#ecf0f1'; ctx.fillRect(350, 50, 100, 150);
            ctx.fillStyle = '#2c3e50'; ctx.fillRect(360, 60, 80, 60); 
            ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(360, 125, 5, 0, Math.PI*2); ctx.fill();
            
            ctx.fillStyle = '#fff'; ctx.fillRect(470, 100, 60, 40);
            ctx.fillStyle = 'red'; ctx.fillRect(480, 110, 40, 5); ctx.fillRect(480, 125, 40, 5);

            // Mat
            ctx.fillStyle = '#d35400'; ctx.fillRect(330, 200, 140, 80);
            
            // Text on Mat (UPDATED: WELCOME)
            ctx.save(); 
            ctx.fillStyle = '#2c3e50'; 
            ctx.font = 'bold 16px Arial'; 
            ctx.textAlign = 'center';
            ctx.fillText("WELCOME", 400, 245); 
            ctx.restore();
            
            // Newspaper moved (to the right, off the mat)
            ctx.fillStyle = '#fff'; ctx.fillRect(520, 220, 30, 20); 
            ctx.fillStyle='#999'; ctx.fillRect(525, 225, 20, 10);

            ctx.fillStyle = '#ecf0f1'; 
            ctx.fillRect(100, 200, 10, 400); ctx.fillRect(690, 200, 10, 400); 
            ctx.fillRect(100, 250, 230, 10); ctx.fillRect(470, 250, 230, 10);
            drawBush(ctx, 50, 550); drawBush(ctx, 750, 550); drawBush(ctx, 50, 450); drawBush(ctx, 750, 450);
        }
        else if (level === 4) {
            // LVL 4: GROCERY - IMPROVED
            // Tiled Floor
            ctx.fillStyle = '#ecf0f1'; ctx.fillRect(0,0,canvas.width, canvas.height); 
            ctx.fillStyle = '#bdc3c7'; 
            for(let x=0; x<canvas.width; x+=50) {
                for(let y=0; y<canvas.height; y+=50) {
                    if((x+y)%100 === 0) ctx.fillRect(x,y,50,50);
                }
            }

            // Back Wall Freezers
            drawFreezer(ctx, 50, 20); drawFreezer(ctx, 300, 20); drawFreezer(ctx, 550, 20);

            // Shelves with Detail
            ctx.fillStyle = '#555'; ctx.fillRect(0, 150, 150, 400); ctx.fillRect(650, 150, 150, 400); // Back
            ctx.fillStyle = '#7f8c8d'; // Shelves
            for(let y=170; y<530; y+=60) {
                ctx.fillRect(0, y, 150, 5); ctx.fillRect(650, y, 150, 5);
                // Products (Boxes, Cans, Bottles)
                for(let x=5; x<140; x+=25) {
                    let type = Math.floor((x+y)%3);
                    if(type === 0) { ctx.fillStyle = '#e74c3c'; ctx.fillRect(x, y-30, 20, 30); } // Box
                    else if(type === 1) { ctx.fillStyle = '#3498db'; ctx.fillRect(x+5, y-25, 15, 25); } // Can
                    else { ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.moveTo(x+660, y-35); ctx.lineTo(x+670, y); ctx.lineTo(x+650, y); ctx.fill(); } // Bottle shape hack
                }
                for(let x=660; x<790; x+=25) {
                    ctx.fillStyle = (x%50===0) ? '#f1c40f' : '#9b59b6';
                    ctx.fillRect(x, y-25, 20, 25);
                }
            }

            // Spill
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(450, 450, 60, 30, 0, 0, Math.PI*2); ctx.fill(); 
            ctx.fillStyle = '#f1c40f'; 
            ctx.beginPath(); ctx.moveTo(400, 400); ctx.lineTo(430, 480); ctx.lineTo(370, 480); ctx.fill();
            ctx.fillStyle = 'black'; ctx.font = '10px Arial'; ctx.fillText("WET", 390, 450);
            
            // Checkout Belt (Metallic look)
            ctx.fillStyle = '#95a5a6'; ctx.fillRect(140, 550, 520, 50); // Trim
            ctx.fillStyle = '#2d3436'; ctx.fillRect(150, 555, 500, 40); // Belt
            ctx.fillStyle = '#bdc3c7'; ctx.fillRect(600, 530, 100, 70); // Register
            
            // Aisle Signs hanging
            drawAisleSign(ctx, 75, 120, "1"); drawAisleSign(ctx, 725, 120, "2");
        }
        else if (level === 5) {
            // LVL 5: SUBWAY - REDESIGNED (INTERIOR VIEW)
            
            // 1. Interior Walls (Back/Side view)
            ctx.fillStyle = '#95a5a6'; // Train wall panel color
            ctx.fillRect(0, 0, canvas.width, 250); 

            // 2. Windows showing motion
            let t = performance.now();
            let offset = (t * 0.8) % 100; // Speed of passing lights
            
            // Draw 4 windows
            for(let x=20; x<800; x+=200) {
                // Window Frame
                ctx.fillStyle = '#2c3e50'; 
                ctx.fillRect(x, 30, 160, 100);
                
                // Dark Tunnel
                ctx.fillStyle = '#000';
                ctx.fillRect(x+5, 35, 150, 90);
                
                // Speed lines/Lights outside
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(x+5 + (150-offset*1.5), 60, 40, 5); // Moving Streak 1
                ctx.fillRect(x+5 + (50+offset), 100, 60, 2); // Moving Streak 2
            }

            // 3. Advertisements above windows
            ctx.fillStyle = '#fab1a0'; ctx.fillRect(100, 10, 100, 15);
            ctx.fillStyle = '#81ecec'; ctx.fillRect(300, 10, 100, 15);
            ctx.fillStyle = '#a29bfe'; ctx.fillRect(500, 10, 100, 15);

            // 4. Seating (Individual Bucket Chairs)
            for(let x=20; x<800; x+=95) {
                // Metal Base (Heater/Support)
                ctx.fillStyle = '#7f8c8d'; // Metal grey
                ctx.fillRect(x+10, 240, 65, 15); // Box under seat
                ctx.fillStyle = '#2d3436'; // Dark vents
                for(let i=15; i<60; i+=10) ctx.fillRect(x+i, 243, 6, 8); // Vents

                // Chair Main Body
                ctx.fillStyle = '#d35400'; // Orange plastic base
                ctx.beginPath();
                ctx.moveTo(x, 150);
                ctx.lineTo(x+85, 150); // Top
                ctx.lineTo(x+80, 240); // Bottom Right taper
                ctx.lineTo(x+5, 240);  // Bottom Left taper
                ctx.fill();

                // Inner Scooped Part (Visual depth)
                ctx.fillStyle = '#e67e22'; // Lighter Orange highlight
                ctx.beginPath();
                ctx.ellipse(x+42, 195, 30, 35, 0, 0, Math.PI*2);
                ctx.fill();
                
                // Metal Armrest between chairs
                if(x < 700) {
                    ctx.fillStyle = '#bdc3c7'; // Silver
                    ctx.fillRect(x+85, 180, 10, 60);
                    ctx.beginPath(); ctx.arc(x+90, 180, 5, 0, Math.PI*2); ctx.fill(); // Round top of armrest
                }
            }

            // 5. Floor (The Play Area)
            ctx.fillStyle = '#7f8c8d'; 
            ctx.fillRect(0, 250, canvas.width, 350);
            // Floor speckles
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            for(let i=0; i<100; i++) {
                ctx.fillRect(Math.random()*800, 250 + Math.random()*350, 3, 3);
            }

            // 6. Hanging Straps (Foreground-ish)
            for(let x=100; x<800; x+=100) {
                ctx.strokeStyle = '#bdc3c7'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 80); ctx.stroke(); // Strap
                ctx.beginPath(); ctx.arc(x, 90, 10, 0, Math.PI*2); ctx.stroke(); // Loop
            }

            // 7. Poles (Vertical silver bars)
            ctx.fillStyle = '#bdc3c7'; // Pole color
            // Draw a few poles in the aisle
            ctx.fillRect(200, 0, 15, 600); 
            ctx.fillRect(600, 0, 15, 600);
            
            // Add some shading to poles to make them round
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(202, 0, 5, 600);
            ctx.fillRect(602, 0, 5, 600);
        }
    }

    // --- HELPER DRAWING FUNCTIONS ---

    function drawFreezer(ctx, x, y) {
        ctx.fillStyle = '#3498db'; // Cold blue interior
        ctx.fillRect(x, y, 200, 100);
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; // Frost
        ctx.fillRect(x, y, 200, 100);
        ctx.strokeStyle = '#bdc3c7'; ctx.lineWidth = 4;
        ctx.strokeRect(x, y, 200, 100); // Frame
        ctx.beginPath(); ctx.moveTo(x+100, y); ctx.lineTo(x+100, y+100); ctx.stroke(); // Split
    }

    function drawAisleSign(ctx, x, y, txt) {
        ctx.fillStyle = '#27ae60';
        ctx.beginPath(); ctx.moveTo(x-30, y); ctx.lineTo(x+30, y); ctx.lineTo(x+20, y+30); ctx.lineTo(x-20, y+30); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial'; ctx.fillText(txt, x-5, y+22);
    }

    function drawStreetLight(ctx, x, y) {
        ctx.fillStyle = '#222'; ctx.fillRect(x-5, y, 10, 100); // Pole
        ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI*2); ctx.fill(); // Glow
        ctx.fillStyle = 'rgba(241, 196, 15, 0.2)'; ctx.beginPath(); ctx.arc(x, y, 60, 0, Math.PI*2); ctx.fill(); // Aura
    }

    function drawTrashCan(ctx, x, y) {
        ctx.fillStyle = '#7f8c8d'; ctx.fillRect(x, y, 30, 40);
        ctx.fillStyle = '#95a5a6'; ctx.fillRect(x-2, y-5, 34, 5); // Lid
    }

    function drawBigTree(ctx, x, y) {
        ctx.fillStyle = '#5d4037'; ctx.fillRect(x, y, 40, 400); // Trunk
        ctx.fillStyle = '#27ae60'; 
        ctx.beginPath(); ctx.arc(x+20, y, 80, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x-20, y+50, 70, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x+50, y+30, 70, 0, Math.PI*2); ctx.fill();
    }

    function drawCrowdMember(ctx, x, y, style, color) {
        ctx.fillStyle = '#1a252f'; 
        ctx.beginPath(); ctx.ellipse(x, y + 15, 20, 10, 0, 0, Math.PI*2); ctx.fill(); 
        ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI*2); ctx.fill(); 
        
        ctx.fillStyle = color;
        if (style === 0) { 
            ctx.beginPath(); ctx.moveTo(x-12, y); ctx.lineTo(x, y-18); ctx.lineTo(x+12, y); ctx.fill();
        } else if (style === 1) { 
            ctx.beginPath(); ctx.arc(x, y-5, 13, Math.PI, 0); ctx.fill();
        } else if (style === 2) { 
            ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x+14, y, 5, 0, Math.PI*2); ctx.fill();
        } else { 
             ctx.fillRect(x-12, y-14, 24, 6);
        }
        
        if (Math.random() > 0.7) {
             ctx.fillStyle = '#ecf0f1';
             ctx.fillRect(x + 10, y + 5, 8, 12);
        }
    }

    function drawMallBench(ctx, x, y) {
        ctx.fillStyle = '#8e44ad'; 
        ctx.fillRect(x-40, y-15, 80, 30);
        ctx.fillStyle = '#34495e'; 
        ctx.fillRect(x-35, y+15, 10, 15); ctx.fillRect(x+25, y+15, 10, 15);
    }
    
    function drawIndoorPlant(ctx, x, y) {
        ctx.fillStyle = '#e67e22'; 
        ctx.beginPath(); ctx.moveTo(x-20, y+40); ctx.lineTo(x+20, y+40); ctx.lineTo(x+25, y); ctx.lineTo(x-25, y); ctx.fill();
        ctx.fillStyle = '#2ecc71'; 
        for(let i=0; i<5; i++) {
             ctx.beginPath(); ctx.ellipse(x, y-20, 10, 30, (i*0.5)-1, 0, Math.PI*2); ctx.fill();
        }
    }

    function drawBush(ctx, x, y) {
        ctx.fillStyle = '#27ae60';
        ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x+20, y+10, 25, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x-20, y+10, 25, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x, y-20, 20, 0, Math.PI*2); ctx.fill();
        // Flowers
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath(); ctx.arc(x+10, y, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x-10, y+5, 5, 0, Math.PI*2); ctx.fill();
    }

    function drawHair(ctx, x, y, style, color, scale = 1) {
        ctx.fillStyle = color;
        if (style === 0) { // Messy
            ctx.beginPath(); ctx.moveTo(x, y-10*scale); 
            ctx.lineTo(x-15*scale, y-25*scale); ctx.lineTo(x, y-20*scale); 
            ctx.lineTo(x+15*scale, y-25*scale); ctx.lineTo(x, y-10*scale); 
            ctx.fill();
            ctx.beginPath(); ctx.arc(x, y-5*scale, 18*scale, Math.PI, 0); ctx.fill();
        } else if (style === 1) { // Neat
            ctx.beginPath(); ctx.arc(x, y-5*scale, 18*scale, Math.PI, 0); ctx.fill();
        } else if (style === 2) { // Cap
            ctx.fillStyle = '#3498db';
            ctx.beginPath(); ctx.arc(x, y-5*scale, 18*scale, Math.PI, 0); ctx.fill();
            ctx.fillRect(x-20*scale, y-10*scale, 40*scale, 5*scale); // brim
        }
    }

    function drawPlayer(ctx, x, y, sweat, target) {
        ctx.save(); ctx.translate(x, y);
        let shake = (gameState === 'PLAYING') ? (Math.random()-0.5) * ((12-timer)*0.5 + globalShake) : 0;
        ctx.translate(shake, shake);

        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 30, 25, 8, 0, 0, Math.PI*2); ctx.fill();
        if (gameState === 'PLAYING') {
            ctx.strokeStyle = timer < 4 ? 'rgba(231, 76, 60, 0.5)' : 'rgba(52, 152, 219, 0.3)';
            ctx.lineWidth = 2; ctx.beginPath();
            let pulse = Math.sin(performance.now() / 200) * 5; ctx.arc(0, 0, 60 + pulse, 0, Math.PI*2); ctx.stroke();
        }

        ctx.fillStyle = '#2c3e50'; ctx.fillRect(-15, 20, 12, 15); ctx.fillRect(5, 20, 12, 15);
        ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.arc(0, 5, 25, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-25, 5, 50, 25); 
        ctx.strokeStyle = '#2980b9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(0, 30); ctx.stroke();
        ctx.fillStyle = '#2980b9'; ctx.fillRect(-15, 20, 30, 10); 
        ctx.strokeStyle = '#ecf0f1'; ctx.lineWidth = 2; 
        ctx.beginPath(); ctx.moveTo(-10, 15); ctx.quadraticCurveTo(-15, 25, -10, 35); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10, 15); ctx.quadraticCurveTo(15, 25, 10, 35); ctx.stroke();

        ctx.fillStyle = '#1c2833'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); 
        ctx.fillStyle = '#f5cba7'; ctx.beginPath(); ctx.arc(0, 2, 12, 0, Math.PI * 2); ctx.fill(); 
        ctx.fillStyle = '#8e44ad'; ctx.beginPath(); ctx.arc(0, -6, 10, Math.PI, 0); ctx.fill();

        let eyeOffsetX = 0, eyeOffsetY = 0;
        if (target) {
            let dx = target.x - x; let dy = target.y - y; let dist = Math.sqrt(dx*dx + dy*dy);
            eyeOffsetX = (dx/dist) * 3; eyeOffsetY = (dy/dist) * 3;
        }

        if (player.blinkTimer > 0.1) {
            ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-5, 0, 4, 0, Math.PI*2); ctx.fill(); ctx.arc(5, 0, 4, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-5 + eyeOffsetX, 0 + eyeOffsetY, 1.5, 0, Math.PI*2); ctx.fill(); ctx.arc(5 + eyeOffsetX, 0 + eyeOffsetY, 1.5, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 1;
            let browAngle = (12 - timer) * 0.1; 
            ctx.save(); ctx.translate(-5, -6); ctx.rotate(-browAngle); ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(3, 0); ctx.stroke(); ctx.restore();
            ctx.save(); ctx.translate(5, -6); ctx.rotate(browAngle); ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(3, 0); ctx.stroke(); ctx.restore();
        } else {
            ctx.strokeStyle = '#d35400'; ctx.lineWidth = 1; 
            ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-2, 0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(8, 0); ctx.stroke();
        }

        if (sweat > 2 || timer < 5) {
            ctx.fillStyle = '#aed6f1'; ctx.beginPath(); ctx.arc(14, -8, 3, 0, Math.PI*2); ctx.fill();
            if (sweat > 5) { ctx.beginPath(); ctx.arc(-16, 2, 2, 0, Math.PI*2); ctx.fill(); }
        }
        ctx.restore();
    }

    function drawThreat(ctx, t) {
        ctx.save(); ctx.translate(t.x, t.y); ctx.scale(t.scale, t.scale);
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 35, 30, 10, 0, 0, Math.PI*2); ctx.fill();

        let bodyColor = '#c0392b';
        if (t.spriteType === 'suit') bodyColor = '#2c3e50';
        if (t.spriteType === 'teen') bodyColor = '#8e44ad'; 
        if (t.spriteType === 'camera') bodyColor = '#34495e'; // Dark jacket for paparazzi
        if (t.spriteType === 'void') bodyColor = '#000';

        // Draw Feet (All except void)
        if (t.spriteType !== 'void') {
             ctx.fillStyle = '#000'; ctx.fillRect(-15, 25, 12, 10); ctx.fillRect(5, 25, 12, 10);
        }

        // Draw Body
        ctx.fillStyle = bodyColor; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-25, 15, 50, 20); 

        // Suit accessories
        if (t.spriteType === 'suit') {
             ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(-5, 15); ctx.lineTo(0, 25); ctx.lineTo(5, 15); ctx.fill(); 
             ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.moveTo(0, 25); ctx.lineTo(-8, 45); ctx.lineTo(8, 45); ctx.fill(); 
             ctx.fillStyle = '#2c3e50'; ctx.fillRect(-26, 15, 10, 20); ctx.fillRect(16, 15, 10, 20); 
        } 
        // Teen accessories
        if (t.spriteType === 'teen') {
            ctx.strokeStyle = '#bdc3c7'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -5, 22, Math.PI, 0); ctx.stroke();
            ctx.fillStyle = '#34495e'; ctx.beginPath(); ctx.arc(-22, -5, 6, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(22, -5, 6, 0, Math.PI*2); ctx.fill();
        }

        // Draw Head (Everyone except void)
        if (t.spriteType !== 'void') {
            ctx.fillStyle = '#f1948a'; ctx.beginPath(); ctx.arc(0, -5, 20, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(-20, -5, 5, 0, Math.PI*2); ctx.fill(); 
            ctx.beginPath(); ctx.arc(20, -5, 5, 0, Math.PI*2); ctx.fill(); 

            // Hair Logic
            if (t.spriteType === 'suit') drawHair(ctx, 0, -5, 1, '#2c3e50', 1.1); 
            else if (t.spriteType === 'teen') drawHair(ctx, 0, -5, t.hairStyle, t.hairColor, 1.1); 
            else if (t.spriteType === 'camera') drawHair(ctx, 0, -5, 2, '#2c3e50', 1.1); // Cap for paparazzi
            else drawHair(ctx, 0, -5, 0, '#e67e22', 1.1); 

            // Eyes (Visible for everyone except maybe void)
            ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(-8, -8, 7, 0, Math.PI*2); ctx.fill(); ctx.arc(8, -8, 7, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(-8, -8, 3, 0, Math.PI*2); ctx.fill(); ctx.arc(8, -8, 3, 0, Math.PI*2); ctx.fill();
            
            // Standard Face Details (if NOT camera)
            if (t.spriteType !== 'camera') {
                ctx.strokeStyle = 'black'; ctx.lineWidth = 3; 
                ctx.beginPath(); ctx.moveTo(-15, -18); ctx.lineTo(-4, -12); ctx.stroke(); 
                ctx.beginPath(); ctx.moveTo(15, -18); ctx.lineTo(4, -12); ctx.stroke();
                
                ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(-3, 2); ctx.stroke();
                ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 5, 10, 0, Math.PI, false); ctx.stroke();
            }
        } 
        
        // CAMERA OVERLAY (The Paparazzi Effect)
        if (t.spriteType === 'camera') {
            // Camera Body covering mouth
            ctx.fillStyle = '#111'; ctx.fillRect(-22, 0, 44, 25); 
            // Lens
            ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(0, 12, 14, 0, Math.PI*2); ctx.fill(); 
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 12, 10, 0, Math.PI*2); ctx.fill(); 
            ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.arc(4, 8, 4, 0, Math.PI*2); ctx.fill(); 
            
            // Hands holding camera
            ctx.fillStyle = '#f1948a'; 
            ctx.beginPath(); ctx.arc(-26, 8, 8, 0, Math.PI*2); ctx.fill(); // Left Hand
            ctx.beginPath(); ctx.arc(26, 8, 8, 0, Math.PI*2); ctx.fill(); // Right Hand

            // Flash unit
            ctx.fillStyle = '#95a5a6'; ctx.fillRect(12, -5, 12, 8);
            
            // Flash Effect
            if (Math.sin(t.blinkTimer * 15) > 0.9) { 
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; 
                ctx.beginPath(); ctx.arc(18, -2, 60, 0, Math.PI*2); ctx.fill(); 
            }
        } 
        else if (t.spriteType === 'void') {
            // Glitchy Void Entity
            
            // 1. Spiky, breathing body
            ctx.fillStyle = '#000';
            ctx.beginPath();
            const spikes = 10; // Number of points
            const time = t.timer * 15; // Animation speed
            
            for (let i = 0; i < spikes * 2; i++) {
                const angle = (Math.PI * 2 * i) / (spikes * 2);
                // Outer radius fluctuates, Inner radius fluctuates differently
                const r = (i % 2 === 0 ? 35 : 20) + Math.sin(time + i) * 5;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            // 2. Glitch Artifacts (Random flickering lines)
            if (Math.random() > 0.7) {
                ctx.fillStyle = '#8e44ad'; // Purple glitch
                ctx.fillRect(-35 + Math.random()*70, -35 + Math.random()*70, 15, 2);
            }
            if (Math.random() > 0.7) {
                ctx.fillStyle = '#fff'; // White static
                ctx.fillRect(-35 + Math.random()*70, -35 + Math.random()*70, 2, 10);
            }

            // 3. Glowing Red Eyes
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#e74c3c';
            ctx.fillStyle = '#e74c3c';
            
            // Angled, menacing eyes
            ctx.beginPath();
            ctx.moveTo(-20, -10); ctx.lineTo(-5, 0); ctx.lineTo(-20, 10); ctx.fill(); // Left
            ctx.beginPath();
            ctx.moveTo(20, -10); ctx.lineTo(5, 0); ctx.lineTo(20, 10); ctx.fill(); // Right
            
            ctx.shadowBlur = 0; // Reset shadow for next draw calls
        }
        ctx.restore();
    }

    function draw() {
        drawEnvironment(ctx, currentLevel);
        drawPlayer(ctx, player.x, player.y, player.sweat, player.nearestThreat);
        threats.forEach(t => { if (t.active) drawThreat(ctx, t); });
        particles.forEach(p => { ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 4, 4); });
        ctx.font = 'bold 20px "Courier New"'; ctx.textAlign = 'center';
        floatingTexts.forEach(ft => { ctx.fillStyle = ft.color; ctx.fillText(ft.text, ft.x, ft.y); });
        
        if (gameState === 'PLAYING') {
            let pulse = timer < 5 ? (Math.sin(performance.now() / 100) + 1) * 0.02 : 0;
            let radius = Math.max(100, 700 - (12 - timer) * 40);
            let grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, radius * (1-pulse), canvas.width/2, canvas.height/2, 800);
            grad.addColorStop(0, "rgba(0,0,0,0)"); grad.addColorStop(1, "rgba(0,0,0,0.9)"); 
            ctx.fillStyle = grad; ctx.fillRect(0,0,canvas.width, canvas.height);
        }
    }

    canvas.addEventListener('mousedown', (e) => {
        if (gameState !== 'PLAYING') return;
        const rect = canvas.getBoundingClientRect();
        let clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
        let clickY = (e.clientY - rect.top) * (canvas.height / rect.height);
        let hit = false;

        threats.forEach(t => {
            if (!t.active) return;
            let dx = clickX - t.x; let dy = clickY - t.y;
            if (Math.sqrt(dx*dx + dy*dy) < t.radius + 15) {
                t.active = false; hit = true;
                spawnParticles(t.x, t.y, '#e74c3c', 20); spawnFloatingText(t.x, t.y, "NOPE!", "#fff");
            }
        });

        if (!hit) {
            timer -= 2; uiTimer.classList.add('anxiety-high'); setTimeout(() => uiTimer.classList.remove('anxiety-high'), 200);
            spawnParticles(clickX, clickY, '#555', 5); spawnFloatingText(clickX, clickY, "-2s", "#ff0000");
        }
    });

    function spawnParticles(x, y, color, count) {
        for(let i=0; i<count; i++) particles.push({ x: x, y: y, vx: (Math.random() - 0.5) * 400, vy: (Math.random() - 1.0) * 400, life: 0.5 + Math.random() * 0.5, color: color });
    }

    function levelComplete() {
        gameState = 'RELIEF'; 
        
        if (currentLevel >= maxLevels) {
            winGame();
            return;
        }

        spawnFloatingText(canvas.width/2, canvas.height/2, "SAFE...", "#2ecc71");
        ctx.fillStyle = 'rgba(46, 204, 113, 0.2)'; ctx.fillRect(0,0,canvas.width, canvas.height);
        
        setTimeout(() => {
            centerMsg.style.display = 'block';
            titleText.innerText = "LEVEL COMPLETE";
            titleText.style.color = "#4ade80";
            descText.innerText = "You survived the interaction.";
            
            btnContainer.innerHTML = `
                <button onclick="nextLevel()">NEXT LEVEL</button>
                <button class="btn-exit" onclick="exitToMenu()">EXIT TO MENU</button>
            `;
        }, 1000);
    }

    function gameOver(reason) {
        gameState = 'LOSE'; container.classList.add('shake-screen');
        titleText.innerText = "PANIC ATTACK!"; titleText.style.color = "#ef4444"; titleText.style.textShadow = "4px 4px 0 #7f1d1d";
        descText.innerText = reason; 
        centerMsg.style.display = 'block';
        
        btnContainer.innerHTML = `
            <button onclick="startGame()">TRY AGAIN</button>
            <button class="btn-exit" onclick="exitToMenu()">EXIT TO MENU</button>
        `;
    }

    function winGame() {
        gameState = 'WIN'; 
        titleText.innerText = "HOME SWEET HOME"; titleText.style.color = "#22c55e"; titleText.style.textShadow = "4px 4px 0 #14532d";
        descText.innerText = "You survived the social gauntlet. \n New levels will be added soon."; 
        centerMsg.style.display = 'block';
        
        btnContainer.innerHTML = `
            <button onclick="startGame()">REPLAY</button>
            <button class="btn-exit" onclick="exitToMenu()">EXIT TO MENU</button>
        `;
    }

    drawEnvironment(ctx, 1); drawPlayer(ctx, 400, 300, 0, null);
