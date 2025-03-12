// Game assets for Space Combat game

// SVG data for spaceship (player)
const spaceshipSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="shipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f8fba" />
      <stop offset="100%" stop-color="#1a3c5a" />
    </linearGradient>
    <filter id="glow" height="300%" width="300%" x="-75%" y="-75%">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <path d="M32,4 L48,44 L32,36 L16,44 L32,4 Z" fill="url(#shipGradient)" stroke="#88ccff" stroke-width="1" filter="url(#glow)"/>
  <path d="M26,30 L26,50 L32,44 L38,50 L38,30 Z" fill="#2a617a" stroke="#88ccff" stroke-width="1"/>
  <circle cx="32" cy="25" r="3" fill="#88ccff" filter="url(#glow)"/>
</svg>
`;

// SVG data for enemy ships (3 types)
const enemyShipsSVG = [
  // Enemy Type 1 - Scout (fast, small)
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="enemyGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff5252" />
        <stop offset="100%" stop-color="#b71c1c" />
      </linearGradient>
      <filter id="enemyGlow1" height="300%" width="300%" x="-75%" y="-75%">
        <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path d="M16,4 L24,20 L16,16 L8,20 L16,4 Z" fill="url(#enemyGradient1)" stroke="#ff8a80" stroke-width="1" filter="url(#enemyGlow1)"/>
    <path d="M13,16 L13,24 L16,22 L19,24 L19,16 Z" fill="#d32f2f" stroke="#ff8a80" stroke-width="1"/>
  </svg>`,
  
  // Enemy Type 2 - Fighter (medium, balanced)
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <defs>
      <linearGradient id="enemyGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7c4dff" />
        <stop offset="100%" stop-color="#311b92" />
      </linearGradient>
      <filter id="enemyGlow2" height="300%" width="300%" x="-75%" y="-75%">
        <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path d="M20,4 L28,28 L20,24 L12,28 L20,4 Z" fill="url(#enemyGradient2)" stroke="#b388ff" stroke-width="1" filter="url(#enemyGlow2)"/>
    <path d="M16,20 L16,32 L20,28 L24,32 L24,20 Z" fill="#512da8" stroke="#b388ff" stroke-width="1"/>
    <path d="M8,16 L16,20 L8,24 Z" fill="#512da8" stroke="#b388ff" stroke-width="1"/>
    <path d="M32,16 L24,20 L32,24 Z" fill="#512da8" stroke="#b388ff" stroke-width="1"/>
  </svg>`,
  
  // Enemy Type 3 - Destroyer (large, powerful)
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <defs>
      <linearGradient id="enemyGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#43a047" />
        <stop offset="100%" stop-color="#1b5e20" />
      </linearGradient>
      <filter id="enemyGlow3" height="300%" width="300%" x="-75%" y="-75%">
        <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path d="M24,4 L36,32 L24,28 L12,32 L24,4 Z" fill="url(#enemyGradient3)" stroke="#a5d6a7" stroke-width="1" filter="url(#enemyGlow3)"/>
    <path d="M18,24 L18,40 L24,36 L30,40 L30,24 Z" fill="#2e7d32" stroke="#a5d6a7" stroke-width="1"/>
    <path d="M8,20 L18,24 L8,28 Z" fill="#2e7d32" stroke="#a5d6a7" stroke-width="1"/>
    <path d="M40,20 L30,24 L40,28 Z" fill="#2e7d32" stroke="#a5d6a7" stroke-width="1"/>
    <circle cx="24" cy="16" r="4" fill="#a5d6a7" filter="url(#enemyGlow3)"/>
  </svg>`
];

// Function to create space background with stars and nebulae
function createSpaceBackground(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Fill background with dark color
  ctx.fillStyle = '#050a1c';
  ctx.fillRect(0, 0, width, height);
  
  // Add stars
  const numStars = Math.floor(width * height / 300);
  for (let i = 0; i < numStars; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 1.5;
    const opacity = Math.random() * 0.8 + 0.2;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fill();
  }
  
  // Add some brighter stars
  const numBrightStars = Math.floor(width * height / 3000);
  for (let i = 0; i < numBrightStars; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 2 + 1;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Add glow to bright stars
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
  }
  
  // Add nebulae
  const numNebulae = Math.floor(width * height / 200000) + 1;
  for (let i = 0; i < numNebulae; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 150 + 50;
    
    // Choose a random color for the nebula
    const colors = [
      'rgba(41, 121, 255, 0.1)',  // Blue
      'rgba(188, 41, 255, 0.1)',   // Purple
      'rgba(255, 41, 84, 0.1)',    // Red
      'rgba(255, 177, 41, 0.1)'    // Orange
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, color.replace('0.1', '0.2'));
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
  }
  
  // Add distant planets
  const numPlanets = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < numPlanets; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 15 + 5;
    
    // Planet base color
    const planetColors = [
      '#a5673f',  // Brown
      '#8d6e63',  // Taupe
      '#78909c',  // Blue-grey
      '#7e57c2',  // Purple
      '#26a69a'   // Teal
    ];
    const planetColor = planetColors[Math.floor(Math.random() * planetColors.length)];
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = planetColor;
    ctx.fill();
    
    // Add simple shading to planet
    const gradient = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  
  return canvas.toDataURL('image/png');
}

// Function to convert SVG to image
function svgToImage(svgData, width, height) {
  return new Promise((resolve) => {
    const img = new Image();
    const svg = new Blob([svgData], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(svg);
    
    img.onload = function() {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.src = url;
  });
}

// Function to create enemy ships with different types
function createEnemyShips(count) {
  const enemies = [];
  
  for (let i = 0; i < count; i++) {
    // Randomly select enemy type
    const typeIndex = Math.floor(Math.random() * enemyShipsSVG.length);
    const type = typeIndex + 1;
    
    // Set properties based on type
    let speed, health, width, height;
    
    switch(type) {
      case 1: // Scout
        speed = 3;
        health = 50;
        width = 32;
        height = 32;
        break;
      case 2: // Fighter
        speed = 2;
        health = 100;
        width = 40;
        height = 40;
        break;
      case 3: // Destroyer
        speed = 1;
        health = 200;
        width = 48;
        height = 48;
        break;
    }
    
    enemies.push({
      x: Math.random() * 2000 - 1000,
      y: Math.random() * 2000 - 1000,
      width: width,
      height: height,
      speed: speed,
      angle: Math.random() * Math.PI * 2,
      health: health,
      type: type
    });
  }
  
  return enemies;
}

// Export game assets
const GameAssets = {
  spaceshipSVG,
  enemyShipsSVG,
  createSpaceBackground,
  svgToImage,
  createEnemyShips
};