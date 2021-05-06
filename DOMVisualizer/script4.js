let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let body = document.childNodes[1];

var radius = 25;
var maxDepth = 0;
var nodes = [];
var circle;
context.font = "12px Monaco";
context.textAlign = "center";

var nodeFill = "#cddff4";
var expandButton = "#ffde99";
var gray = "#333333";
var lightGray = "#d2d3d4";
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
    position: { x: 0, y: 0 },
    expandButton: { x: 0, y: 0, width: 0, height: 0 },
    isExpanded: true,
    attributesButton: { x: 0, y: 0, width: 0, height: 0 },
  };

  var childDepth = depth + 1;
  var childCount = node.childNodes.length;
  var width = (end - start) / childCount;
  var child;
  var childStart;

  for (let i = 0; i < childCount; i++) {
    childStart = start + i * width;
    //console.log(node.children);
    child = createTree(
      node.childNodes[i],
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
  // console.log(node);
  if (!node) return;
  var x = node.start + (node.end - node.start) / 2;
  var y = node.depth * height + radius;
  //console.log(` x: ${x} y: ${y} `);

  //console.log(node);
  // array of positions
  node.position.x = x;
  node.position.y = y;
  nodes.push(node);

  // draw line from parent to child
  node.children.forEach((child) => {
    //console.log(child);
    var childX = child.start + (child.end - child.start) / 2;
    var childY = child.depth * height + radius;

    /* context.beginPath();
    console.log(child.DOMNode.innerText);
    var text = child.DOMNode.innerText;
    var textWidth = context.measureText(text).width;
    var lineHeight = 12 * 1.286;
    context.fillText(text, childX + 5, childY + 25);
    context.strokeRect(childX + 5, childY + 15, textWidth, lineHeight);
    context.closePath(); */
    context.strokeStyle = lightGray;

    context.beginPath();
    context.moveTo(x, y + radius);
    context.lineTo(childX, childY);
    context.stroke();
    context.closePath();

    if (child.DOMNode.hasChildNodes && child.DOMNode.nodeType == 1) {
      if (child.isExpanded) {
        let text = "+";
        context.fillStyle = expandButton;
        context.fillRect(childX - 40, childY - 10, 15, 15);
        context.font = "16px Monaco";
        context.fillStyle = gray;
        context.fillText(text, childX - 32, childY + 1);

        child.expandButton.x = childX - 40;
        child.expandButton.y = childY - 10;
        child.expandButton.width = 15;
        child.expandButton.height = 15;
      } else {
        let text = "-";
        context.fillStyle = expandButton;
        context.fillRect(childX - 40, childY - 10, 15, 15);
        context.font = "16px Monaco";
        context.fillStyle = gray;
        context.fillText(text, childX - 32, childY + 1);

        child.children = [];
      }
    }
    drawNodes(child, height);
    // drawNodes(child, height);
  });

  if (node.DOMNode.nodeType == 3) {
    // draw rect
    if (node.DOMNode.nodeValue.trim().length > 0) {
      var text = node.DOMNode.nodeValue;
      var textWidth = context.measureText(text).width;
      context.beginPath();
      context.strokeRect(x - textWidth / 2, y, textWidth, 20);
      context.font = "12px Monaco";
      context.fillStyle = gray;
      context.textAlign = "center";
      context.fillText(text, x, y + 14);
      context.closePath();
    }
  } else if (node.DOMNode.nodeType == 1) {
    // draw cicle
    context.beginPath();
    // start angle = 0 end angle Math.PI * 2
    circle = new Path2D();
    circle.arc(x, y, radius, 0, Math.PI * 2, false);
    context.font = "12px Monaco";
    context.fillStyle = nodeFill;
    context.fill(circle);
    context.fillStyle = gray;
    context.fillText(node.DOMNode.tagName.toLowerCase(), x, y + 2);
    context.closePath();
  }
};

//initial depth 0 start with 0 and end: canvas.width
var doc = createTree(body, null, 0, canvas.width, 0);
currentTree = doc;
levelHeight = canvas.height / (maxDepth + 1);
drawNodes(doc, levelHeight);

canvas.addEventListener("click", (e) => {
  //console.log(e);

  let pos = {
    x: e.clientX - canvas.getBoundingClientRect().left,
    y: e.clientY - canvas.getBoundingClientRect().top,
  };

  /* var lol = findClickedShape(currentTree, pos.x, pos.y);
  console.log(lol); */
  //found = findNode(currentTree, pos.x, pos.y);
  //console.log("found");
  //console.log(found); // top y
  // left x
  // detect square click
  clickedExpand = findClickedExpandButton(currentTree, pos.x, pos.y);
  if (clickedExpand) {
    if (clickedExpand.isExpanded) {
      clickedExpand.isExpanded = false;
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawNodes(currentTree, levelHeight);
    } else {
      clickedExpand.isExpanded = true;
      currentTree = createTree(body, null, 0, canvas.width, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawNodes(currentTree, levelHeight);
    }
    return;
  }
});

canvas.addEventListener("mousemove", (e) => {
  let pos = {
    x: e.clientX - canvas.getBoundingClientRect().left,
    y: e.clientY - canvas.getBoundingClientRect().top,
  };
  let htmlBox = document.querySelector("#htmlContent");
  found = findNode(currentTree, pos.x, pos.y);
  if (found) {
    console.log("fdfdfdf");
    htmlBox.style.display = "block";
    htmlBox.innerText = found.DOMNode.outerHTML;
    return;
  } else {
    htmlBox.style.display = "none";
  }
});

const findClickedExpandButton = (node, x, y) => {
  var isInNodeExpandButton =
    y > node.expandButton.y &&
    y < node.expandButton.y + node.expandButton.height &&
    x > node.expandButton.x &&
    x < node.expandButton.x + node.expandButton.width;

  var child;
  var i;

  /*   if (
    Math.sqrt(
      (pos.x - node.position.x) * (pos.x - node.position.x) +
        (pos.y - node.position.y) * (pos.y - node.position.y)
    ) < 20
  ) */

  if (isInNodeExpandButton) {
    return node;
  }

  for (i = 0; i < node.DOMNode.childElementCount; i++) {
    child = node.children[i];

    if (x > child.start && x < child.end) {
      return findClickedExpandButton(child, x, y);
    }
  }

  return null;
};

const findNode = (node, x, y) => {
  /*   if (
    Math.sqrt(
      (pos.x - node.position.x) * (pos.x - node.position.x) +
        (pos.y - node.position.y) * (pos.y - node.position.y)
    ) < 20
  ) */

  if (isInNode) {
    return node;
  }

  for (i = 0; i < node.DOMNode.childElementCount; i++) {
    child = node.children[i];

    if (x > child.start && x < child.end) {
      return findNode(child, x, y);
    }
  }

  return null;
};

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
});
