$(document).ready(function() {
    // Get the modal and comment box elements
    var modal = document.getElementById("myModal");
    var commentBox = document.getElementById("commentBox");
  
    // Get the <span> elements that close the modals
    var span = document.getElementsByClassName("close");
  
    // Function to open the modal when clicking on an image
    $("img.img-fluid").click(function() {
        var authorImageSrc = $(this).attr("src");
        var authorName = $(this).data("author-name");
        var authorInterests = $(this).data("author-interests");
  
        $("#authorImage").attr("src", authorImageSrc);
        $("#authorName").text(authorName);
        $("#authorInterests").text(authorInterests);
  
        modal.style.display = "block";
    });
  
    // Function to handle "Follow" button click
    $("#followBtn").click(function() {
        window.open('your-social-media-url', '_blank');
    });
  
    // Function to close modal when clicking on <span> (x) or outside modal
    window.onclick = function(event) {
        if (event.target == modal || event.target == commentBox) {
            modal.style.display = "none";
            commentBox.style.display = "none";
        }
    };
  
    // Function to show the comment box when clicking "Submit New Post" button
    $("#submitPostBtn").click(function() {
        commentBox.style.display = "block";
        commentBox.style.zIndex = "1000";
    });
  
    // Function to handle comment submission
    $("#commentForm").submit(function(event) {
        event.preventDefault(); // Prevent default form submission
  
        // Get comment data from the form
        var commentName = $("#commentName").val();
        var commentContent = $("#commentContent").val();
  
        // Perform validation checks
        if (commentName.trim() === "") {
            alert("Please enter your name.");
            return;
        }
  
        if (commentContent.trim() === "") {
            alert("Please enter your comment.");
            return;
        }
  
        // If validation passes, submit the comment via AJAX
        var commentData = {
            name: commentName,
            comment: commentContent
        };
        //sending comment to server using AJAX
        $.ajax({
            url: "/submit-comment",  //URL where comment will be submitted
            type: "POST",  //HTTP method used for the request (POST)
            data: commentData, //dsts to be sent to the server (comment data)
            success: function(response) { //callback function excuted if the request succeeds
                console.log("Comment submitted successfully!"); // Log a success message to the console
            },
            error: function(xhr, status, error) { // Callback function executed if the request fails
                console.error("Error submitting comment:", error); // Log an error message to the console
            }
        });
  
        // After handling the form submission, close the comment box
        commentBox.style.display = "none";
    });
  
    // Function to open the modal for submitting a new blog post
    $("#openBlogFormBtn").click(function() {
        $("#blogModal").modal("show");
    });
  
    // Function to handle blog submission
    $("#submitBlogBtn").click(function() {
        // Retrieve form data
        var bloggerName = $("#bloggerName").val();
        var blogContent = $("#blogContentModal").val();
        var images = $("#imageUploadModal")[0].files;
  
        // Validate form data
        if (bloggerName.trim() === "") { //remove whitespace characters
            alert("Please enter your name.");
            return;
        }
  
        if (blogContent.trim() === "") {
            alert("Please enter your blog content.");
            return;
        }
  
        // Process image uploads (if any)
        var formData = new FormData();
        formData.append("bloggerName", bloggerName);
        formData.append("blogContent", blogContent);
        for (var i = 0; i < images.length; i++) {
            formData.append("images[]", images[i]);
        }
  
        // Send form data to the server using AJAX
        $.ajax({
            url: "/submit-blog",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log("Blog post submitted successfully!");
            },
            error: function(xhr, status, error) {
                console.error("Error submitting blog post:", error);
            }
        });
    });
  });
  