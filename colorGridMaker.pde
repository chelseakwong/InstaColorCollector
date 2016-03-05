import java.io.FileReader;
import java.util.Iterator;
String[] fileNames = {"NepalEarthquake", "ParisAttacks", "GazaConflict", 
                      "TianJinFactoryExplosions", "ShenZhenLandslide",
                      "RefugioOilSpill", "ShorehamAirshow", 
                      "ChennaiFloods", "BentoRodrigues"};

String masterPath = "/Users/chelseakwong/GitHub/instagrab/";

PImage cir;

int ind = 1;

int totalCol, globMin, globMax;
int Y_AXIS = 1;
int X_AXIS = 2;

class ColorSwatch{
  String hex;
  int count;
}

ArrayList<ColorSwatch> colorSwatches = new ArrayList<ColorSwatch>();

int getCountAndInit(JSONArray arr){
  int init = 0;
  int min = arr.getJSONObject(0).getInt("count");
  int max = min;
  for (int i = 0; i< arr.size(); i++){
     JSONObject col = arr.getJSONObject(i);
     ColorSwatch temp = new ColorSwatch();
     temp.hex = col.getString("color");
     temp.count = col.getInt("count");
     init += temp.count;
     if (temp.count > max) max = temp.count;
     if (temp.count < min) min = temp.count;
     colorSwatches.add(temp);
  }
  globMin = min;
  globMax = max;
  return init;
}

void drawSwatches(){
  int cols = 10;
  int boxsize = width/cols;
  for (int i = 0; i<colorSwatches.size();i++){
    ColorSwatch temp = colorSwatches.get(i);
    String c = temp.hex;
    int x = i / cols;
    int y = i % cols;
    fill(unhex(c)|0xFF000000);
    noStroke();
    rect(x*boxsize, y*boxsize, boxsize,boxsize);
  }
  save(fileNames[ind] + ".png");
}

void setup(){
  size(600,600);
  int cols = 1;
  int rows = 100;
  float topOffset = height*0.2;
  //float cellWidth = width/cols;
  float cellHeight = (height*0.8)/rows;
  String filename = masterPath + fileNames[ind] + "_colors.json";
  JSONObject json = loadJSONObject(filename);
  JSONArray values = json.getJSONArray("colors");
  totalCol = getCountAndInit(values);
 
  drawSwatches();
  //iterate through swatches and draw a gradient
  //int cellWidth = width/100;
  
  //int lastUpX = 0; 
  //int lastDownX = cellWidth;
  //for (int i = 0; i < colorSwatches.size()-2; i++){
  //  int hex1 = unhex(colorSwatches.get(i).hex);
  //  color c1 = color(red(hex1),green(hex1),blue(hex1));
  //  int hex2 = unhex(colorSwatches.get(i+1).hex);
  //  color c2 = color(red(hex2),green(hex2),blue(hex2));
  //  setGradient(lastUpX, 0, cellWidth, height, c1, c2, X_AXIS);
  //  lastDownX += cellWidth;
  //  lastUpX += cellWidth;
  //}
  
  
  //for (int i = 0; i<colorSwatches.size(); i++){
  //  ColorSwatch temp = colorSwatches.get(i);
     
  //  float x = (int)random(width*0.2,width*0.8);
  //  //float y = map(temp.count,globMin, globMax, height*0.2, height*0.8);
  //  int row = i/cols;
  //  //int col = i % cols;
  //  //float x = col * cellWidth + (cellWidth/2);
  //  float y = row * cellHeight + (cellHeight/2) + (topOffset/2);
     
  //  //float size = (float(temp.count)/totalCol)*(width/2);
  //  float size = map(temp.count, globMin, globMax, 1, (width/16));
  //  int hexColor = unhex(temp.hex)|0xFF000000;
  //  //println(hexColor);
  //  //println("making clouds");
  //  clouds.add(new Cloud(new PVector(x-50, y+50), (int)size, hexColor));
  //}
  //println("done adding clouds");
}

void setGradient(int x, int y, float w, float h, color c1, color c2, int axis ) {

  noFill();

  if (axis == Y_AXIS) {  // Top to bottom gradient
    for (int i = y; i <= y+h; i++) {
      float inter = map(i, y, y+h, 0, 1);
      color c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x+w, i);
    }
  }  
  else if (axis == X_AXIS) {  // Left to right gradient
    for (int i = x; i <= x+w; i++) {
      float inter = map(i, x, x+w, 0, 1);
      color c = lerpColor(c1, c2, inter);
      stroke(c);
      line(i, y, i, y+h);
    }
  }
}