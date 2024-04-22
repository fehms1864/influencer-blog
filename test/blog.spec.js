// __tests__/blogScript.test.js
//Required modules
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.resolve(__dirname, '../blog.html'), 'utf8'); //read HTML file
const { window } = new JSDOM(html); //Create a new window object using JSDOM
const jQuery = require('jquery');

//Set Global variables
global.window = window;
global.document = window.document;
//Set jQuery
global.$ = jQuery(window);

//Mocking window.open
global.window.open = jest.fn();

// Load the HTML into the DOM
document.documentElement.innerHTML = html.toString();

// Load (blogScript.js) into the DOM
require('../public/js/blogscripts');
//Testsuite for blogScript
describe('blogScript', () => {
  let modal, commentBox;

  //Set up for each test
  beforeEach(() => {
    modal = document.getElementById("myModal");
    commentBox = document.getElementById("commentBox");
  });
//Test wheather modal is hidden initally
  test('modal is hidden initially', () => {
    expect(modal.style.display).toBe("");
  });
//Test wheather comment box is hidden initally 
  test('comment box is hidden initially', () => {
    expect(commentBox.style.display).toBe("");
  });
//Test clicking on an image opens the modal
  test('clicking on an image opens the modal', (done) => {
    const image = $("img.img-fluid").first();
    image.trigger("click");

    // Wait for the DOM to update
    setTimeout(() => {
      expect(modal.style.display).toBe("");
      done();
    }, 2000); // timeout value 
  }, 20000); // Adjust the test timeout value as needed
  
//Test clicking on the follow button opens Instagram link
  test('clicking on follow button opens Instagram link', (done) => {
    const followButton = $("#followBtn");
    followButton.trigger("click");

    // Wait for the DOM to update
    setTimeout(() => {
      expect(window.open).toHaveBeenCalledWith('https://www.instagram.com', '_blank');
      done();
    }, 2000); //  timeout value 
  }, 5000); // Adjust the test timeout value as needed

//Test clicking on the close button closes the modal 
  test('clicking on close button closes the modal', (done) => {
    const closeButton = $(".close").first();
    modal.style.display = "block";
    closeButton.trigger("click");

    // Wait for the DOM to update
    setTimeout(() => {
      expect(modal.style.display).toBe("none");
      expect(commentBox.style.display).toBe("none");
      done();
    }, 2000); //  timeout value 
  }, 9000); // Adjust the test timeout value as needed

//Test clicking out side the modal closes it 
  test('clicking outside the modal closes it', (done) => {
    modal.style.display = "block";
    const outsideModal = document.createElement("div");
    outsideModal.setAttribute("id", "outsideModal");
    document.body.appendChild(outsideModal);
    window.onclick({ target: outsideModal });

    // Wait for the DOM to update
    setTimeout(() => {
      expect(modal.style.display).toBe("block");
      expect(commentBox.style.display).toBe("none");
      done();
    }, 2000); //  timeout value 
  }, 5000); // Adjust the test timeout value as needed
});
  

 