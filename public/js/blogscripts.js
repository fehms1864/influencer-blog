$(document).ready(function() {
  // Get the modal
  var modal = document.getElementById("myModal");
  var commentBox = document.getElementById("commentBox");

  // Get the <span> elements that close the modals
  var span = document.getElementsByClassName("close");

  // When the user clicks on an image, open the modal
  $("img.img-fluid").click(function() {
      // Get author's information from the image
      var authorImageSrc = $(this).attr("src");
      var authorName = $(this).data("author-name");
      var authorInterests = $(this).data("author-interests");

      // Populate modal with author's information
      $("#authorImage").attr("src", authorImageSrc);
      $("#authorName").text(authorName);
      $("#authorInterests").text(authorInterests);

      // Show the modal
      modal.style.display = "block";
  });

  // When the user clicks the "Follow" button
  $("#followBtn").click(function() {
      // Replace 'your-social-media-url' with the actual URL you want to link to
      window.open('your-social-media-url', '_blank');
  });

  // When the user clicks on <span> (x), close the modal
  for (var i = 0; i < span.length; i++) {
      span[i].onclick = function() {
          modal.style.display = "none";
          commentBox.style.display = "none"; // Close the comment box too
      };
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
      if (event.target == modal || event.target == commentBox) {
          modal.style.display = "none";
          commentBox.style.display = "none"; // Close the comment box too
      }
  };

  // When the user clicks the "Submit New Post" button
  $("#submitPostBtn").click(function() {
      // Show the comment box
      commentBox.style.display = "block";
      commentBox.style.zIndex = "1000";  //check this zindex for shading
  });

  // When the user submits the comment form
  $("#commentForm").submit(function(event) {
      // Prevent the default form submission
      event.preventDefault();

      //  handle the form submission here (e.g., send the comment data to a server)
      // Get the comment data from the form
      var commentData = {
          name: $("#commentName").val(), 
          comment: $("#commentContent").val() 
      };

      // You can perform any additional validation or processing here

      // For demonstration purposes, let's log the comment data to the console
      console.log("Comment Data:", commentData);

      // After handling the form submission, you can close the comment box
      commentBox.style.display = "none";
  });

  // Function to open the modal for blog submission
  $("#openBlogFormBtn").click(function() {
      $("#blogModal").modal("show");
  });

  // Function to handle blog submission
  $("#submitBlogBtn").click(function() {
      // Retrieve form data
      var bloggerName = $("#bloggerName").val();
      var blogContent = $("#blogContentModal").val();
      var images = $("#imageUploadModal")[0].files;

      // Validate form data (e.g., check if required fields are filled)

      // Process image uploads (if any)
      var formData = new FormData();
      formData.append("bloggerName", bloggerName);
      formData.append("blogContent", blogContent);
      for (var i = 0; i < images.length; i++) {
          formData.append("images[]", images[i]);
      }

      // Send form data to the server using ajax
  });
});
