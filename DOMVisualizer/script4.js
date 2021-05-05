let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let body = document.querySelector("body");

var radius = 20;
var maxDepth = 0;
var nodes = [];
var circle;

var currentTree;

const createTree = (node, parentNode, start, end, depth) => {
  if (depth > maxDepth) {
    maxDepth = depth;
  }
  var newNode = {
    DOMNode: node,
    parentNode: parentNode,
    children: [],
    start: start,
    end: end,
    depth: depth,
  };

  var childDepth = depth + 1;
  var childCount = newNode.DOMNode.childElementCount;
  var width = (end - start) / childCount;
  var child;
  var childStart;

  for (let i = 0; i < childCount; i++) {
    childStart = start + i * width;

    child = createTree(
      node.children[i],
      newNode,
      childStart,
      childStart + width,
      childDepth
    );
    newNode.children.push(child);
  }

  return newNode;
};

const drawNodes = (node, height) => {
  console.log(
    ` node: ${node.DOMNode.tagName} x: ${node.start} y: ${node.end} depth: ${node.depth}`
  );
  var tagName = node.DOMNode.tagName;
  var x = node.start + (node.end - node.start) / 2;
  var y = node.depth * height + 20;
  console.log(` x: ${x} y: ${y} `);

  // array of positions
  node.x = x;
  node.y = y;
  nodes.push(node);

  // draw line from parent to child
  node.children.forEach((child) => {
    console.log(child);
    var childX = child.start + (child.end - child.start) / 2;
    var childY = child.depth * height + 20;
    context.fillStyle = "BLACK";
    /* context.beginPath();
    console.log(child.DOMNode.innerText);
    var text = child.DOMNode.innerText;
    var textWidth = context.measureText(text).width;
    var lineHeight = 12 * 1.286;
    context.fillText(text, childX + 5, childY + 25);
    context.strokeRect(childX + 5, childY + 15, textWidth, lineHeight);
    context.closePath(); */
    context.beginPath();
    context.moveTo(x, y + 20);
    context.lineTo(childX, childY);
    context.stroke();
    context.closePath();

    drawNodes(child, height);
  });

  // draw cicle
  context.beginPath();
  // start angle = 0 end angle Math.PI * 2
  circle = new Path2D();
  circle.arc(x, y, radius, 0, Math.PI * 2, false);
  context.font = "12px Monaco";
  context.stroke(circle);
  context.fillStyle = "green";
  context.fillText(tagName, x - 10, y);
  context.closePath();
};

//initial depth 0 start with 0 and end: canvas.width
var doc = createTree(body, null, 0, canvas.width, 0);
//var doc = createTree(body, 0, canvas.width);
currentTree = doc;
levelHeight = canvas.height / (maxDepth + 1);
drawNodes(doc, levelHeight);

// canvas on click
canvas.addEventListener("click", (e) => {
  let pos = {
    x: e.clientX - canvas.getBoundingClientRect().left,
    y: e.clientY - canvas.getBoundingClientRect().top,
  };
  nodes.forEach((node) => {
    if (
      Math.sqrt(
        (pos.x - node.x) * (pos.x - node.x) +
          (pos.y - node.y) * (pos.y - node.y)
      ) < 20
    ) {
      console.log("element " + node.DOMNode.nodeName);
    }
  });
});

var snap = document.querySelector("#snap");
var linkDiv = document.querySelector("#img");
snap.addEventListener("click", () => {
  var dataURL = canvas.toDataURL();
  var temp = document.querySelector(".snapImg");
  var imgLink = null;
  if (temp == null) {
    imgLink = document.createElement("a");
    imgLink.className = "snapImg";
  } else {
    imgLink = temp;
  }
  imgLink.href = dataURL;
  imgLink.innerText = "image Link (open in it in new tap)";
  linkDiv.appendChild(imgLink);
  console.log(imgLink);
});
