//requires log
//requires nbt
//requires jquery
//requires util
//requires blockinfo

var theworld;
var ChunkSizeY = 128;
var ChunkSizeZ = 16;
var ChunkSizeX = 16;

var minx = -4;
var minz = -4;
var maxx = 4;
var maxz = 4;
var ymin = 5;

function b36(n) {
  var r = "";
  
  if (n === 0) 
    r = '0';
  else 
    if (n < 1) 
      r = '-' + baseConverter(Math.abs(n), 10, 36);
    else 
      r = baseConverter(n, 10, 36);
  r = r.toLowerCase();
  return r;
}

function posfolder(pos) {
  var n = new Number(pos);
  r = b36(n.mod(64));
  return r;
}

function chunkfilename(x, z) {
  return 'c.' + b36(x) + '.' + b36(z) + '.dat';
}

function chunkfile(x, z) {
  //return posfolder(x) + '/' + posfolder(z) + '/' + chunkfilename(x, z);
  for (var i=0; i< theworld.chunkIndex.length; i++) {
    var ch = theworld.chunkIndex[i];
    var dat = ch.dat;
    if (i<4) log(JSON.stringify(dat));
    if (dat['xpos']==x && dat['zpos']==z) return ch.filename;
  }
  return 'unindexed';
}

function transNeighbors(blocks, x, y, z) {
  for (i = x - 1; i < x + 2 & i < ChunkSizeX; i++) 
    for (j = y - 1; j < y + 2; j++) 
      for (k = z - 1; k < z + 2 & k < ChunkSizeZ; k++) {
        if (!(i == x && j == y && k == z)) {
          var index = j + (k * ChunkSizeY + (i * ChunkSizeY * ChunkSizeZ));
          var blockID = blocks[index];
          if (blockID === 0)             
            return true;
        }
      }
  return false;
}

function extractChunk(blocks, chunk, lighting) {
  chunk.vertices = [];
  chunk.colors = [];
  
  for (x = 0; x < ChunkSizeX; x++) {
    for (z = 0; z < ChunkSizeZ; z++) {
      for (y = ymin; y < ChunkSizeY; y++) {
        var blockInfoOffset = y + (z * ChunkSizeY + (x * ChunkSizeY * ChunkSizeZ));
        var blockID = blocks[blockInfoOffset];
        var blockType = blockInfo['_-1'];
        blockID = '_' + blockID.toString();
        
        if (blockInfo[blockID]) {
          blockType = blockInfo[blockID];
        }
        else {
          blockType = blockInfo['_-1'];
          log('unknown block type ' + blockID);
        }
        var show = false;
        
        //if ((y>64) & blockType.id ===1) 
        //  show = true;
        if (blockType.id != 0) {
          show = transNeighbors(blocks, x, y, z);
        }
        
        if (show) {
          var xmod = (minx + (maxx - minx) / 2.0) * ChunkSizeX;
          var zmod = (minz + (maxz - minz) / 2.0) * ChunkSizeZ;
          
          var skyLight = lighting[0][Math.floor((blockInfoOffset) / 2)];
          var blockLight = lighting[1][Math.floor((blockInfoOffset) / 2)];

          if (blockInfoOffset % 2 !== 0) {
            skyLight = (skyLight & 0xF0) >> 4;
            blockLight = (blockLight & 0xF0) >> 4;
          } else {
            skyLight = skyLight & 0x0F;
            blockLight = blockLight & 0x0F;
          }
            
          skyLight = skyLight / 16.0;
          blockLight = blockLight / 16.0;
          var lightlevel = Math.max(skyLight, blockLight);
          if (lightlevel === 0) {
            lightlevel = 0.3;
	  }
          

	  // Some ugly cut&paste code, to get basic quads to try lighting on
          theworld.vertices.push(((-1 * xmod) + x + (chunk.pos.x) * ChunkSizeX * 1.00000) / 30.00);
          theworld.vertices.push(((y + 1) * 1.0) / 30.0);
          theworld.vertices.push(((-1 * zmod) + z + (chunk.pos.z) * ChunkSizeZ * 1.00000) / 30.00);
          
          theworld.vertices.push(((-1 * xmod) + (x + 1) + (chunk.pos.x) * ChunkSizeX * 1.00000) / 30.00);
          theworld.vertices.push(((y + 1) * 1.0) / 30.0);
          theworld.vertices.push(((-1 * zmod) + z + (chunk.pos.z) * ChunkSizeZ * 1.00000) / 30.00);
          
          theworld.vertices.push(((-1 * xmod) + (x + 1) + (chunk.pos.x) * ChunkSizeX * 1.00000) / 30.00);
          theworld.vertices.push(((y + 1) * 1.0) / 30.0);
          theworld.vertices.push(((-1 * zmod) + (z + 1) + (chunk.pos.z) * ChunkSizeZ * 1.00000) / 30.00);
          
          theworld.vertices.push(((-1 * xmod) + x + (chunk.pos.x) * ChunkSizeX * 1.00000) / 30.00);
          theworld.vertices.push(((y + 1) * 1.0) / 30.0);
          theworld.vertices.push(((-1 * zmod) + z + (chunk.pos.z) * ChunkSizeZ * 1.00000) / 30.00);
          
          theworld.vertices.push(((-1 * xmod) + x + (chunk.pos.x) * ChunkSizeX * 1.00000) / 30.00);
          theworld.vertices.push(((y + 1) * 1.0) / 30.0);
          theworld.vertices.push(((-1 * zmod) + (z + 1) + (chunk.pos.z) * ChunkSizeZ * 1.00000) / 30.00);
          
          theworld.vertices.push(((-1 * xmod) + (x + 1) + (chunk.pos.x) * ChunkSizeX * 1.00000) / 30.00);
          theworld.vertices.push(((y + 1) * 1.0) / 30.0);
          theworld.vertices.push(((-1 * zmod) + (z + 1) + (chunk.pos.z) * ChunkSizeZ * 1.00000) / 30.00);
          
          theworld.colors.push(blockType.rgba[0] * lightlevel);
          theworld.colors.push(blockType.rgba[1] * lightlevel);
          theworld.colors.push(blockType.rgba[2] * lightlevel);
          theworld.colors.push(blockType.rgba[3]);
          
          theworld.colors.push(blockType.rgba[0] * lightlevel);
          theworld.colors.push(blockType.rgba[1] * lightlevel);
          theworld.colors.push(blockType.rgba[2] * lightlevel);
          theworld.colors.push(blockType.rgba[3]);
          
          theworld.colors.push(blockType.rgba[0] * lightlevel);
          theworld.colors.push(blockType.rgba[1] * lightlevel);
          theworld.colors.push(blockType.rgba[2] * lightlevel);
          theworld.colors.push(blockType.rgba[3]);
          
          theworld.colors.push(blockType.rgba[0] * lightlevel);
          theworld.colors.push(blockType.rgba[1] * lightlevel);
          theworld.colors.push(blockType.rgba[2] * lightlevel);
          theworld.colors.push(blockType.rgba[3]);
          
          theworld.colors.push(blockType.rgba[0] * lightlevel);
          theworld.colors.push(blockType.rgba[1] * lightlevel);
          theworld.colors.push(blockType.rgba[2] * lightlevel);
          theworld.colors.push(blockType.rgba[3]);
          
          theworld.colors.push(blockType.rgba[0] * lightlevel);
          theworld.colors.push(blockType.rgba[1] * lightlevel);
          theworld.colors.push(blockType.rgba[2] * lightlevel);
          theworld.colors.push(blockType.rgba[3]);
        }
        
      } // y
    } // z
  } // x 
  //log(JSON.stringify(chunk.vertices)); 

  countChunks++;
}


function parsechunk(data, pos) {
  var blocks = tagfixed(data, 'Blocks', 32768);
  var skyLights = tagfixed(data, 'SkyLight', 16384);
  var blockLights = tagfixed(data, 'BlockLight', 16384);
  var c = Object();
  c.pos = pos;
  extractChunk(blocks, c, [skyLights, blockLights]);
  theworld.chunks.push(c);
  return c;
}

function chunkload(url, pos, callback) {
  log('loading chunk pos=' + JSON.stringify(pos));
  var fl = chunkfile(pos.x, pos.z);
  if (fl != 'unindexed') {
          var loc = url + '/' + fl;
          $.ajax({
            url: loc,
            dataType: 'html',
            type: 'GET',
            success: function(data) {
              callback(theworld, parsechunk(data, pos));
            },
            error: function() {
              callback(theworld, null);
            }
          });
  } else {
    callback(theworld, null);
  }
}


function nextChunk(pos) {
  var next = new Object();
  next.cont = false;
  if (pos.x < maxx) {
    next.x = pos.x + 1;
    next.z = pos.z;
    next.cont = true;
  }
  else {
  
    if (pos.z < maxz) {
      next.z = pos.z + 1;
      next.x = minx;
      next.cont = true;
    }
  }
  return next;
}

var countChunks = 0;

function loadArea() {
  var w = this;
  
  chunkload(theworld.url, theworld.pos, function(chunk) {
    var c = theworld.chunks[0];
    if (countChunks % 2 == 0) status('loaded chunk at ' + theworld.pos.x + ', ' + theworld.pos.z);
    theworld.pos = nextChunk(theworld.pos);
    if (theworld.pos.cont) {
      theworld.loadArea();
    }
    else {
      status('loaded ' + countChunks + ' chunks &nbsp; &nbsp; &nbsp; LIKE A BOSS');
      start(theworld.vertices, theworld.colors);
    }
  });
}


function World(url, index) {
  this.url = url;
  this.chunks = [];
  this.indexLocation = index;
}

World.prototype.init = function(cb) {
  theworld = this;
  this.vertices = [];
  this.colors = [];
  this.pos = {
    x: minx,
    y: 64,
    z: minz
  };
  
  convertColors(); // in blockinfo.js
  w = this;
  $.get(this.url + '/level.dat', function(data) {
    status('Loading chunk index..');
    $.get(w.indexLocation, function(ind) {
      status('Index has ' + ind.length + ' chunks');
      w.chunkIndex = ind;
      //log(JSON.stringify(w.chunkIndex));
    });
 
    log(w.url);
    w.chunks = [];
  });
};

World.prototype.chunksToPoints = function() {

};

World.prototype.loadArea = loadArea;

