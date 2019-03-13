document.addEventListener("DOMContentLoaded", function(event) {
   
    try{
        document.querySelector("#editprofile").onsubmit = (e) => {
            e.preventDefault();
            let new_name = document.querySelector("#name").value.trim();
            document.querySelector("#confirm-edit-name").value = new_name;
    
            let new_email = document.querySelector("#email").value.trim();
            document.querySelector("#confirm-edit-email").value = new_email;
    
            let new_password = document.querySelector("#password").value;
            document.querySelector("#confirm-edit-password").value = new_password;
    
    
    
            if(name!='' || email!='' || password!='')
            {
                document.querySelector("#dialogoverlay").style.display = "block";
                document.querySelector(".overlay-message").style.display = "block";
            }
    
        };
    }catch(e){};
    
    try{
        document.querySelector('.cancel-overlay').onclick = () => {
            document.querySelector("#dialogoverlay").style.display = "none";
            document.querySelector(".overlay-message").style.display = "none";
        };
    
    }catch(e){};

    try{
        document.querySelectorAll(".addbook-form").forEach(form => {
            form.onsubmit = (e) => {
                e.preventDefault();
                //get the book id that user is trying to save
                let book_id = form.children[0].value;

                $.ajax({
                    url : "/users/addBook",
                    method : "PUT",
                    data : {
                        book : book_id
                    },
                    success: (data) =>{
                       
                        document.querySelector("#dialogoverlay").style.display = "block";
                        document.querySelector(".overlay-message").style.display = "block";
                        let message_div = document.querySelector(".overlay-message").children[0];
                        message_div.children[0].innerHTML = data.message;

                    
                       
                    },
                    error: () =>{
                        console.log("nothing happens");
                    }

                    
                });
                
            }
        })

    }catch(e){};

    try{
        document.querySelectorAll(".removebook-form").forEach(form => {
            form.onsubmit = (e) => {
                e.preventDefault();

                //get the book id that user is trying to save
                let book_id = form.children[0].value;

                $.ajax({
                    url : "/users/removeBook",
                    method : "DELETE",
                    data : {
                        book : book_id
                    },
                    success: (data) =>{
                       
                        document.querySelector("#dialogoverlay").style.display = "block";
                        document.querySelector(".overlay-message").style.display = "block";
                        let message_div = document.querySelector(".overlay-message").children[0];
                        message_div.children[0].innerHTML = "Book as been removed from your list";
                        form.parentElement.remove();
                    },
                    error: () =>{
                        console.log("nothing happens");
                    } 
                });
            }
        })

    }catch(e){};
   
   
});
