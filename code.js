/**This is my 7th Grade 3D Model of DNA!
 * Thanks to Peter Collingridge for giving 3D tutorials.
 * 
 * You can edit the DNA Setup, the size, how twisty it is,
 * or the colors for adenine, thymine, cytosine, guanine, deoxyribose, phosphates, and the background.
 * 
 * You can rotate the DNA using arrow keys or dragging the mouse around.
 * 
 * You can also resize the DNA with the - and + keys.
 * The numpad's + and - keys work too.
 * When using + on the number bar (above qwertyuiop), make sure you hold shift.
 **/


void setup() { 
  size(1400, 700); 
} 

var dnaSize = 1;
var twistiness = 20/57;

var backgroundLight = 0.1;

var backgroundColor = color(250, 192, 243);
var patternColor = color(255, 255, 255);

var adenineColor = color(255, 0, 0);
var thymineColor = color(255, 123, 0);
var cytosineColor = color(0, 0, 255);
var guanineColor = color(61, 61, 61);
var phosphateColor = color(135, 91, 43);
var deoxyriboseColor = color(152, 0, 222);

var dnaSetup = [
    ['a','t'],
    ['c','g'],
    ['g','c'],
    ['a','t'],
    ['a','t'],
    ['t','a'],
    ['c','g'],
    ['g','c'],
    ['t','a'],
    ['g','c'],
    ['c','g']
];

smooth();
var mode = 0;

var nodeColor = color(255, 0, 0);
var edgeColor = color(0, 0, 0);
var nodeSize = 8;

var mouseIsClicked = false;

var keys = [];
void keyPressed() {
    keys[keyCode] = true;
};
void keyReleased() {
    keys[keyCode] = false;
};

var subtractVectors = function(v1, v2){
    return [[v1[0] - v2[0]],
            [v1[1] - v2[1]],
            [v1[2] - v2[2]]];
};
var normalOfPlane = function(face, nodes) {
    var n1 = nodes[face[0]];
    var n2 = nodes[face[1]];
    var n3 = nodes[face[2]];
    
    var v1 = subtractVectors(n1, n2);
    var v2 = subtractVectors(n1, n3);
    
    var v3 = [[v1[1]*v2[2] - v1[2]*v2[1]],
              [v1[2]*v2[0] - v1[0]*v2[2]],
              [v1[0]*v2[1] - v1[1]*v2[0]]];
              
    return v3;
};

var normaliseVector = function(v) {
    var d = sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
    return [v[0]/d, v[1]/d, v[2]/d];
};

var lightVector =[0.5, -0.2, -2];
var lightVector = normaliseVector(lightVector);

var dotProduct = function(v1, v2){
    // Assume everything has 3 dimensions
    return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
};

var rotateZSide = function(angle,nodes) {
    var sinAngle = sin(angle);
    var cosAngle = cos(angle);
    
    for (var i = 0; i < nodes.length; i ++) {
        var node = nodes[i];
        var x = node[0];
        var y = node[1];
        node[0] = x * cosAngle - y * sinAngle;
        node[1] = y * cosAngle + x * sinAngle;
    }
};
var rotateYSide = function(angle,nodes,obj) {
    var sinAngle = sin(angle);
    var cosAngle = cos(angle);
    
    for (var i = 0; i < nodes.length; i ++) {
        var node = nodes[i];
        var x = node[0];
        var z = node[2];
        node[0] = x * cosAngle - z * sinAngle;
        node[2] = z * cosAngle + x * sinAngle;
    }
    obj.x = obj.x * cosAngle - obj.z * sinAngle;
    obj.z = obj.z * cosAngle + obj.x * sinAngle;
};
var rotateXSide = function(angle,nodes,obj) {
    var sinAngle = sin(angle);
    var cosAngle = cos(angle);
    
    for (var i = 0; i < nodes.length; i ++) {
        var node = nodes[i];
        var z = node[2];
        var y = node[1];
        node[2] = z * cosAngle - y * sinAngle;
        node[1] = y * cosAngle + z * sinAngle;
    }
    obj.z = obj.z * cosAngle - obj.y * sinAngle;
    obj.y = obj.y * cosAngle + obj.z * sinAngle;
};

var Molecule = function(x,y,z,w,h,d,type) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.nodes = [
        [x - w/2, y - h/2, z - d/2],
        [x - w/2, y - h/2, z + d/2],
        [x - w/2, y + h/2, z - d/2],
        [x - w/2, y + h/2, z + d/2],
        [x + w/2, y - h/2, z - d/2],
        [x + w/2, y - h/2, z + d/2],
        [x + w/2, y + h/2, z - d/2],
        [x + w/2, y + h/2, z + d/2]
    ];
    this.edges = [
        [0, 1],
        [1, 3],
        [3, 2],
        [2, 0],
        [4, 5],
        [5, 7],
        [7, 6],
        [6, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7]
    ];
    this.faces = [
        [0, 1, 3, 2],
        [1, 0, 4, 5],
        [0, 2, 6, 4],
        [3, 1, 5, 7],
        [5, 4, 6, 7],
        [2, 3, 7, 6]];
    
    //color
    switch (type) {
        case 'a':
            this.fillCol = adenineColor;
            break;
        case 't':
            this.fillCol = thymineColor;
            break;
        case 'c':
            this.fillCol = cytosineColor;
            break;
        case 'g':
            this.fillCol = guanineColor;
            break;
        case 'd':
            this.fillCol = deoxyriboseColor;
            break;
        case 'p':
            this.fillCol = phosphateColor;
            break;
    }
};
var molecules = [];

var dnaCheck = function() {
    for (var i = 0; i < dnaSetup.length; i ++) {
        if (dnaSetup[i].length !== 2) {
            throw ('\nDNA has 2 sides, not ' + dnaSetup[i].length + '!');
        }
        
        var dna1 = dnaSetup[i][0];
        var dna2 = dnaSetup[i][1];
        var dnaMatch;
        if (dna1 === 'a') {
            dnaMatch = 't';
        }
        if (dna1 === 't') {
            dnaMatch = 'a';
        }
        if (dna1 === 'c') {
            dnaMatch = 'g';
        }
        if (dna1 === 'g') {
            dnaMatch = 'c';
        }
        var dnaError = '\n' + dna1 + ' matches with ' + dnaMatch + ', not ' + dna2 + '.';
        if (dna2 !== dnaMatch) {
            throw (dnaError);
        }
    }
};
var legend = function() {
    noStroke();
    fill(adenineColor);
    rect(10,10,15,15);
    text('Adenine',30,22);
    
    fill(thymineColor);
    rect(10,30,15,15);
    text('Thymine',30,42);
    
    fill(cytosineColor);
    rect(10,50,15,15);
    text('Cytosine',30,62);
    
    fill(guanineColor);
    rect(10,70,15,15);
    text('Guanine',30,82);
    
    fill(deoxyriboseColor);
    rect(10,90,15,15);
    text('Deoxyribose',30,102);
    
    fill(phosphateColor);
    rect(10,110,15,15);
    text('Phosphate',30,122);
    
    stroke(173, 138, 0);
    fill(242, 211, 119);
    //adenine box
    if (mouseIn(10,10,70,15)) {
        rect(8,30,60,20);
        fill(173, 138, 0);
        text('C5H5N5',15,45);
    }
    //thymine box
    if (mouseIn(10,30,70,15)) {
        rect(8,50,60,20);
        fill(173, 138, 0);
        text('C5H6N2O2',10,65);
    }
    //cytosine box
    if (mouseIn(10,50,72,15)) {
        rect(8,70,60,20);
        fill(173, 138, 0);
        text('C4H5N3O',10,85);
    }
    //guanine box
    if (mouseIn(10,70,70,15)) {
        rect(8,90,60,20);
        fill(173, 138, 0);
        text('C5H5N5O',10,105);
    }
    //deoxyribose box
    if (mouseIn(10,90,90,15)) {
        rect(8,110,60,20);
        fill(173, 138, 0);
        text('C5H10O4',10,125);
    }
    //phosphate box
    if (mouseIn(10,110,80,15)) {
        rect(8,130,60,20);
        fill(173, 138, 0);
        text('PO43-',10,145);
    }
};

var pattern = function() {
    stroke(patternColor);
    for (var x = 0; x < width/144; x ++) {
        for (var i = 0; i < 144; i ++) {
            for (var a = 0; a < height/100; a ++) {
                if (i % 5 === 0) {
                    strokeWeight(3);
                    point(i + sin(i*10*57.2958)*10 + x * 144,100 - i + sin(i*10*57.2958)*10 + a * 144);
                    point(i + -sin(i*10*57.2958)*10 + x * 144,100 - i + -sin(i*10*57.2958)*10 + a * 144);
                    strokeWeight(1);
                    line(i + sin(i*10*57.2958)*10 + x * 144,100 - i + sin(i*10*57.2958)*10 + a * 144, i + -sin(i*10*57.2958)*10 + x * 144,100 - i + -sin(i*10*57.2958)*10 + a * 144);
                }
            }
        }
    }
    strokeWeight(1);
};

for (var i = 0; i < dnaSetup.length; i ++) {
    var interval = i*100-dnaSetup.length*100/2;
    
    var lDeoxyribose = new Molecule(-100,interval,0,25,80,20,'d');
    var rDeoxyribose = new Molecule(100,interval,0,25,80,20,'d');
    var lPhosphate = new Molecule(-100,-80+interval,0,25,80,20,'p');
    var rPhosphate = new Molecule(100,80+interval,0,25,80,20,'p');
    var lNucleotide = new Molecule(-43,0+interval,0,85,25,25,dnaSetup[i][0]);
    var rNucleotide = new Molecule(43,0+interval,0,85,25,25,dnaSetup[i][1]);
    
    rotateYSide(twistiness*i,lDeoxyribose.nodes,lDeoxyribose);
    rotateYSide(twistiness*i,lPhosphate.nodes,lPhosphate);
    rotateYSide(twistiness*i,rDeoxyribose.nodes,rDeoxyribose);
    rotateYSide(twistiness*i,lNucleotide.nodes,lNucleotide);
    rotateYSide(twistiness*i,rNucleotide.nodes,rNucleotide);
    rotateYSide(twistiness*i,rPhosphate.nodes,rPhosphate);
    
    rotateYSide(10,rPhosphate.nodes,rPhosphate);
    rotateYSide(-10,lPhosphate.nodes,lPhosphate);
    
    molecules.push(lDeoxyribose);
    molecules.push(rDeoxyribose);
    molecules.push(lPhosphate);
    molecules.push(rPhosphate);
    molecules.push(lNucleotide);
    molecules.push(rNucleotide);
}

var zSort = function(list){
    var alist = list;
    var inOrder = false;
    while (inOrder === false) {
        inOrder = true;
        for (var num = 1; num < alist.length; num ++) {
            var current = alist[num];
            var previous = alist[num - 1];
            var preZ = previous.z;
            var curZ = current.z;
            if (preZ < curZ) {
                inOrder = false;
                alist[num] = previous;
                alist[num - 1] = current;
            }
        }
    }
    return alist;
};

var mouseIn = function(x,y,w,h) {
    if (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h) { return true; }
    return false;
};
var button = function(x,y,w,h,drawButton) {
    drawButton(x,y,w,h);
    if (mouseIn(x,y,w,h) && mouseIsClicked) { return true; }
    
    return false;
};
var menuButton = function(x,y,fn) {
    var display = function(x,y,w,h) {
        noStroke();
        fill(82, 82, 82);
        rect(x,y,w + 5,h + 5, 5);
        fill(255, 255, 255);
        rect(x + 6, y + 1 + 5  ,13,2,5);
        rect(x + 6, y + 1 + 5*2,13,2,5);
        rect(x + 6, y + 1 + 5*3,13,2,5);
    };
    if (button(x,y,20,25,display)) { fn(); }
};

var menuOut = false; //in
var menuX = 0;
var menuY = 0;
var menuMode = 'dna';
var menuMessage = 'DNA, or DeoxyriboNucleic Acid, is the main form that genetic material takes in your body, like your body’s own instruction manual. All living spicies on Earth have DNA, but no person has exact same version as another. With DNA, all of the cells in your body get the same copy. However, not all of your cells share the same purpose. For example, your stomach cells don’t do the same thing as your heart cells. DNA doesn’t care. Think of your DNA as a large book of instructions, your body as a large corporation whose job is to survive, and your cells as individual workers. The same book is given to all of them, but when a worker receives it, they don’t need to read the instructions for everyone else. They simply flip to their chapter, and read what they have to do.';
var menu = function() {
    if (menuY > 0) {
        fill(138, 138, 138);
        rect(width - 600,height - menuY,610,menuY,5);
        
        fill(0, 0, 0);
        text(menuMessage,width-500,height-menuY+10,500,Infinity);
        
        fill(102, 102, 102);
        strokeWeight(2);
        stroke(0, 0, 0);
        rect(width-598,height-menuY+28,80,40);
        rect(width-598,height-menuY+68,80,40);
        rect(width-598,height-menuY+108,80,40);
        strokeWeight(1);
        noStroke();
        
        textAlign(CENTER,CENTER);
        fill(0, 0, 0);
        textSize(14);
        text('What is\nDNA?',width-560,height-menuY+48);
        text('Storage',width-560,height-menuY+88);
        text('How is it\nread?',width-560,height-menuY+128);
        textSize(12);
        textAlign(LEFT,BASELINE);
        
        fill(0, 0, 0, 20);
        if (mouseIn(width-598,height-menuY+28,80,40)) {
            rect(width-598,height-menuY+28,80,40);
            if (mousePressed) {
                rect(width-598,height-menuY+28,80,40);
            }
            if (mouseIsClicked) {
                menuMode = 'dna';
                menuMessage = 'DNA, or DeoxyriboNucleic Acid, is the main form that genetic material takes in your body, like your body’s own instruction manual. All living spicies on Earth have DNA, but no person has exact same version as another. With DNA, all of the cells in your body get the same copy. However, not all of your cells share the same purpose. For example, your stomach cells don’t do the same thing as your heart cells. DNA doesn’t care. Think of your DNA as a large book of instructions, your body as a large corporation whose job is to survive, and your cells as individual workers. The same book is given to all of them, but when a worker receives it, they don’t need to read the instructions for everyone else. They simply flip to their chapter, and read what they have to do.';
            }
        }
        if (mouseIn(width-598,height-menuY+68,80,40)) {
            rect(width-598,height-menuY+68,80,40);
            if (mousePressed) {
                rect(width-598,height-menuY+68,80,40);
            }
            if (mouseIsClicked) {
                menuMode = 'chromosomes';
                menuMessage = 'As you can see, in order to have enough information to instruct an entire living object, you would need a whole lot of DNA, especially since each cell needs all the information for each of the other cells, as well. In fact, if you were to line up all of the DNA in your whole body from each of your cells combined end to end, you would end up with a string so long, it could go from the Earth to the Sun 100 times! So how does your body store it? Actually, it’s a lot like making rope.  A strand of DNA twirls itself in a spiral, making a slightly thicker but a lot shorter “string”. The “string” repeats that process to make itself even shorter and thicker. Repeat this process several times, and you’re left over with a chromosome, a strand of DNA that’s been compressed using that process. The human body has 23 pairs of chromosomes adding up to 46. The amount of chromosomes differs from each species.';
            }
        }
        if (mouseIn(width-598,height-menuY+108,80,40)) {
            rect(width-598,height-menuY+108,80,40);
            if (mousePressed) {
                rect(width-598,height-menuY+108,80,40);
            }
            if (mouseIsClicked) {
                menuMode = 'rna';
                menuMessage = 'Your DNA is stored in chromosomes in your nucleus, but it can’t read itself. Ten million ribosomes wait outside of the nucleus to do this for you. However, you have lots of DNA, so it can’t all go outside of the nucleus. Your cell makes a copy of the gene it wants to use, called mRNA, standing for messenger RiboNucleic Acid. The only difference is the nucleotide Thymine, in DNA, which gets turned into Uracil in the mRNA. The mRNA leaves the nucleus, now small enough to do so, and finds its way to a ribosome to begin translation. During translation, “codons”, or groups of 3 nucleotides, are read by tRNA, standing for transfer RNA, to be translated into amino acids, which are then made by the ribosomes to be used. Refer to the codon table for the various codons and amino acids that can be used in translation.';
            }
        }
        
        fill(0, 0, 0, 60);
        if (menuMode === 'dna') {
            rect(width-598,height-menuY+28,80,40);
        }
        if (menuMode === 'chromosomes') {
            rect(width-598,height-menuY+68,80,40);
        }
        if (menuMode === 'rna') {
            rect(width-598,height-menuY+108,80,40);
        }
    }
};

var helpIcon = function(x,y,txt) {
    fill(87, 87, 87);
    ellipse(x,y,15,15);
    
    textAlign(CENTER,CENTER);
    textSize(10);
    fill(255, 255, 255);
    text('?',x,y);
    textAlign(LEFT,BASELINE);
    textSize(12);
    
    if (dist(x,y,mouseX,mouseY) < 7.5) {
        stroke(173, 138, 0);
        fill(242, 211, 119);
        beginShape();
        vertex(mouseX,mouseY);
        vertex(mouseX + 15,mouseY - 5);
        vertex(mouseX + 15,mouseY - 8);
        vertex(mouseX + 275,mouseY - 8);
        vertex(mouseX + 275,mouseY + 125);
        vertex(mouseX + 15,mouseY + 125);
        vertex(mouseX + 15,mouseY + 5);
        vertex(mouseX,mouseY);
        endShape();
        noStroke();
        
        fill(173, 138, 0);
        text(txt, mouseX + 20, mouseY - 3, 250, Infinity);
    }
};

var codon;
var codons = [
    [
        ['UUU','UUC','UUA','UUG'],
        ['UCU','UCC','UCA','UCG'],
        ['UAU','UAC','UAA','UAG'],
        ['UGU','UGC','UGA','UGG']
    ],
    [
        ['CUU','CUC','CUA','CUG'],
        ['CCU','CCC','CCA','CCG'],
        ['CAU','CAC','CAA','CAG'],
        ['CGU','CGC','CGA','CGG']
    ],
    [
        ['AUU','AUC','AUA','AUG'],
        ['ACU','ACC','ACA','ACG'],
        ['AAU','AAC','AAA','AAG'],
        ['AGU','AGC','AGA','AGG']
    ],
    [
        ['GUU','GUC','GUA','GUG'],
        ['GCU','GCC','GCA','GCG'],
        ['GAU','GAC','GAA','GAG'],
        ['GGU','GGC','GGA','GGG']
    ]
];
var acid;
var aPos;
var aAcids = [
    [
        [['Phenylalanine',0,1],['Leucine',2,3]],
        [['Serine',0,3]],
        [['Tyrosine',0,1],['Stop Copying',2,3]],
        [['Cysteine',0,1],['Stop Copying',2,2],['Tryptonphan',3,3]]
    ],
    [
        [['Leucine',0,3]],
        [['Proline',0,3]],
        [['Histidine',0,1],['Glutamine',2,3]],
        [['Arginine',0,3]]
    ],
    [
        [['Isoleucine',0,1],['Methionine (start)',2,3]],
        [['Threonine',0,3]],
        [['Asparagine',0,1],['Lysine',2,3]],
        [['Serine',0,1],['Arginine',2,3]]
    ],
    [
        [['Valine',0,3]],
        [['Alanine',0,3]],
        [['Aspartic Acid',0,1],['Glutamic Acid',2,3]],
        [['Glycine',0,3]]
    ]
];
var tableOut = false;
var codonTable = function(x,y) {
    stroke(0, 0, 0);
    fill(74, 74, 74, 200);
    rect(x - 10,y - 20,440,315);
    noStroke();
    fill(0, 0, 0);
    textSize(10);
    for (var first = 0; first < codons.length; first ++) {
        for (var second = 0; second < codons[first].length; second ++) {
            for (var third = 0; third < codons[first][second].length; third ++) {
                codon = codons[first][second][third];
                text(codon,x + second * 110,y + first * 80 + third * 15);
            }
            for (var a = 0; a < aAcids[first][second].length; a ++) {
                acid = aAcids[first][second][a][0];
                aPos = aAcids[first][second][a][1] + (aAcids[first][second][a][2] - aAcids[first][second][a][1])/2;
                text(acid,x + second * 110 + 25,y + first * 80 + aPos * 15);
            }
        }
    }
    textSize(12);
};

void draw() {
    background(backgroundColor);
    pattern();
    
    dnaCheck();
    legend();
    
    pushMatrix();
    translate(width/2,height/2);
    scale(height/400*0.25);
    scale(dnaSize);
    
    molecules.sort(function(a, b) {
        return b.z - a.z;
    });
    
    for (var a = 0; a < molecules.length; a ++) {
        var nodes = molecules[a].nodes;
        var edges = molecules[a].edges;
        
        
        if (mode % 2 === 0) {
            stroke(backgroundColor);
            for (var i = 0; i < molecules[a].faces.length; i ++) {
                var face = molecules[a].faces[i];
                var fnorm = normalOfPlane(face, nodes);
                
                if (fnorm[2] < 0) {
                    var l = max(0, dotProduct(lightVector, normaliseVector(fnorm)));
                    l = backgroundLight + (1 - backgroundLight) * l;
                    fill(lerpColor(color(0,0,0),molecules[a].fillCol, l));
                    
                    quad(nodes[face[0]][0], nodes[face[0]][1],
                         nodes[face[1]][0], nodes[face[1]][1],
                         nodes[face[2]][0], nodes[face[2]][1],
                         nodes[face[3]][0], nodes[face[3]][1]);
                }
            }
        }
        else {
            stroke(molecules[a].fillCol);
            for (var i = 0; i < edges.length; i ++) {
                var n0 = edges[i][0];
                var n1 = edges[i][1];
                var node0 = nodes[n0];
                var node1 = nodes[n1];
                
                line(node0[0],node0[1],node1[0],node1[1]);
            }
        }
    
        if (keys[LEFT]) {
            rotateYSide(-0.05,nodes,molecules[a]);
        }
        if (keys[RIGHT]) {
            rotateYSide(0.05, nodes,molecules[a]);
        }
        if (keys[UP]) {
            rotateXSide(0.05, nodes,molecules[a]);
        }
        if (keys[DOWN]) {
            rotateXSide(-0.05, nodes,molecules[a]);
        }
    }
    popMatrix();
    
    
    if (keys[173] || keys[109] || keys[189]) {
        dnaSize -= 0.05;
    }
    if ((keys[16] && (keys[61] || keys[187])) || keys[107]) {
        dnaSize += 0.05;
    }
    stroke(0, 102, 7);
    strokeWeight(3);
    fill(82, 82, 82);
    rect(width-110,10, 100,60,8);
    fill(0, 0, 0);
    textAlign(CENTER,CENTER);
    text('Transparent\nor\nOpaque',width-60,40);
    strokeWeight(1);
    textAlign(LEFT,BASELINE);
    
    //codon table
    if (button(0,(tableOut) ? height-348 : height-30,80,30, function(x,y) {
        fill(135, 135, 135);
        rect(0,y,80,30);
        fill(0, 0, 0);
        text('Codon Table',5,y + 18);
    })) {
        tableOut = !tableOut;
    }
    if (tableOut) {
        codonTable(10,height - 297);
    }
    
    menuButton(width-25,height-25-menuY,function() {menuOut = !menuOut;});
    menu();
    
    helpIcon(120,20,'DNA is written in a code. The \'language\' of DNA is written with four nucleotides, Adenine, Thymine, Cytosine, and Guanine, commonly abbreviated to A T C G. A nucleotide is always paired up in a base-pair in the double-stranded DNA. Adenine always goes with Thymine, and Cytosine with Guanine, and vice-versa. The base-pairs are held together using Deoxyribose and Phosphate.');
    
    if (menuOut && menuY < 150) { menuY += (sq(((150-menuY)/30)) + 1)*2; }
    if (!menuOut && menuY > 0) { menuY -= (sq(menuY/30) + 1)*2; }
    mouseIsClicked = false;
};

void mouseClicked() {
    mouseIsClicked = true;
    if (mouseX > width-110 && mouseX < width-10 && mouseY > 10 && mouseY < 70) {
        mode ++;
    }
};

void mouseDragged() {
    for (var a = 0; a < molecules.length; a ++) {
        var nodes = molecules[a].nodes;
        rotateYSide((mouseX-pmouseX) / 64, nodes, molecules[a]);
        rotateXSide(-(mouseY-pmouseY) / 64, nodes, molecules[a]);
    }
};
