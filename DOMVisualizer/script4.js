let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let body = document.childNodes[1];
canvas.width = window.innerWidth;

var radius = 25;
var maxDepth = 0;
var nodes = [];
var circle;

var nodeFill = "#cddff4";
var expandButton = "#ffde99";
var gray = "#333333";
var lightGray = "#d2d3d4";
var almostwhite = "#d6d6d6";
var currentTree;
var attributesButton = "#da7f8f";
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
    attributesOpen: false,
  };

  var childDepth = depth + 1;
  var childCount = node.childNodes.length;
  var width = (end - start) / childCount;
  var child;
  var childStart;

  for (let i = 0; i < childCount; i++) {
    childStart = start + i * width;
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
  if (!node) return;
  var x = node.start + (node.end - node.start) / 2;
  var y = node.depth * height + radius;

  node.position.x = x;
  node.position.y = y;

  context.font = "12px Monaco";
  context.textAlign = "center";

  // draw nodes
  if (node.DOMNode.nodeType == 3) {
    // draw text nodes in rect
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
    // draw elemnt nodes in circles
    context.beginPath();
    circle = new Path2D();
    circle.arc(x, y, radius, 0, Math.PI * 2, false);
    context.font = "12px Monaco";
    context.fillStyle = nodeFill;
    context.fill(circle);
    context.fillStyle = gray;
    context.fillText(node.DOMNode.tagName.toLowerCase(), x, y + 2);
    context.closePath();
  }

  node.children.forEach((child) => {
    var childX = child.start + (child.end - child.start) / 2;
    var childY = child.depth * height + radius;

    // draw line from parent to child
    context.strokeStyle = lightGray;
    context.beginPath();
    context.moveTo(x, y + radius);
    context.lineTo(childX, childY);
    context.stroke();
    context.closePath();

    // draw expand button
    var expandButtonText;
    if (child.DOMNode.hasChildNodes && child.DOMNode.nodeType == 1) {
      if (child.isExpanded) {
        expandButtonText = "+";
      } else {
        expandButtonText = "-";
        child.children = [];
      }

      context.fillStyle = expandButton;
      context.fillRect(childX - 40, childY - 15, 15, 15);
      context.font = "16px Monaco";
      context.fillStyle = gray;
      context.fillText(expandButtonText, childX - 32, childY - 2);

      child.expandButton.x = childX - 40;
      child.expandButton.y = childY - 15;
      child.expandButton.width = 15;
      child.expandButton.height = 15;

      // draw attributes button
      context.fillStyle = attributesButton;
      context.fillRect(childX - 40, childY + 5, 18, 12);
      context.font = "10px Monaco";
      context.fillStyle = gray;
      context.fillText("..", childX - 32, childY + 12);

      child.attributesButton.x = childX - 40;
      child.attributesButton.y = childY + 5;
      child.attributesButton.width = 18;
      child.attributesButton.height = 12;
    }
    drawNodes(child, height);
  });
};

var doc = createTree(body, null, 0, canvas.width, 0);
currentTree = doc;
levelHeight = canvas.height / (maxDepth + 1);
drawNodes(doc, levelHeight);

canvas.addEventListener("click", (e) => {
  let pos = {
    x: e.clientX - canvas.getBoundingClientRect().left,
    y: e.clientY - canvas.getBoundingClientRect().top,
  };

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

  clickedAttrButton = findClickedAttributesButton(currentTree, pos.x, pos.y);

  if (clickedAttrButton) {
    if (!clickedAttrButton.attributesOpen) {
      clickedAttrButton.attributesOpen = true;
      drawNameVlueAttr(clickedAttrButton.DOMNode.attributes);
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
      clickedAttrButton.attributesOpen = false;
      drawNodes(currentTree, levelHeight);
    }
  }
});

const drawAttributes = (attributes) => {
  let text;
  let offset = 1;
  context.fillStyle = almostwhite;
  context.fillRect(10, clickedAttrButton.position.y - 15, 200, 60);
  context.fillStyle = "black";
  context.textAlign = "left";
  if (attributes.length <= 0) {
    context.fillText(
      "No Attributes",
      20,
      clickedAttrButton.position.y + offset
    );
  }
  for (let i = 0; i < attributes.length; i++) {
    text =
      clickedAttrButton.DOMNode.attributes[i].nodeName +
      ": " +
      clickedAttrButton.DOMNode.attributes[i].nodeValue;

    context.fillText(text, 20, clickedAttrButton.position.y + offset);
    offset += 20;
  }
};

const findClickedExpandButton = (node, x, y) => {
  var isInNodeExpandButton =
    y > node.expandButton.y &&
    y < node.expandButton.y + node.expandButton.height &&
    x > node.expandButton.x &&
    x < node.expandButton.x + node.expandButton.width;

  var child;

  if (isInNodeExpandButton) {
    return node;
  }

  for (let i = 0; i < node.DOMNode.childElementCount; i++) {
    child = node.children[i];

    if (x > child.start && x < child.end) {
      return findClickedExpandButton(child, x, y);
    }
  }

  return null;
};

const findClickedAttributesButton = (node, x, y) => {
  var isInNodeAttributesButton =
    y > node.attributesButton.y &&
    y < node.attributesButton.y + node.attributesButton.height &&
    x > node.attributesButton.x &&
    x < node.attributesButton.x + node.attributesButton.width;

  var child;

  if (isInNodeAttributesButton) {
    return node;
  }

  for (let i = 0; i < node.DOMNode.childElementCount; i++) {
    child = node.children[i];

    if (x > child.start && x < child.end) {
      return findClickedAttributesButton(child, x, y);
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
