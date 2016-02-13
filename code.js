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
  size(1000, 600); 
} 

var dnaSize = 1;
var twistiness = 10;

var backgroundLight = 0.1;

var backgroundColor = color(255, 255, 255);
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

//Non-user code can be accessed with the blue button. Be careful when editing, you could make a bug.

smooth();
var mode = 1;

var nodeColor = color(255, 0, 0);
var edgeColor = color(0, 0, 0);
var nodeSize = 8;

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
    rect(-190,-190,15,15);
    text('Adenine',-170,-178);
    
    fill(thymineColor);
    rect(-190,-170,15,15);
    text('Thymine',-170,-158);
    
    fill(cytosineColor);
    rect(-190,-150,15,15);
    text('Cytosine',-170,-138);
    
    fill(guanineColor);
    rect(-190,-130,15,15);
    text('Guanine',-170,-118);
    
    fill(deoxyriboseColor);
    rect(-190,-110,15,15);
    text('Deoxyribose',-170,-98);
    
    fill(phosphateColor);
    rect(-190,-90,15,15);
    text('Phosphate',-170,-78);
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



void draw() {
    background(backgroundColor);
    
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
            rotateYSide(-1,nodes,molecules[a]);
        }
        if (keys[RIGHT]) {
            rotateYSide(1, nodes,molecules[a]);
        }
        if (keys[UP]) {
            rotateXSide(1, nodes,molecules[a]);
        }
        if (keys[DOWN]) {
            rotateXSide(-1, nodes,molecules[a]);
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
};

void mouseDragged() {
    for (var a = 0; a < molecules.length; a ++) {
        var nodes = molecules[a].nodes;
        rotateYSide((mouseX-pmouseX) / 16, nodes, molecules[a]);
        rotateXSide(-(mouseY-pmouseY) / 16, nodes, molecules[a]);
    }
};

void mouseReleased = function() {
    if (mouseX > width-110 && mouseX < width-10 && mouseY > 10 && mouseY < 70) {
        mode ++;
    }
};
