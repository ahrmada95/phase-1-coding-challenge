//urls
const imgsUrl = 'http://localhost:3000/images/';
const commentsUrl = 'http://localhost:3000/comments/';
const randoDogUrl = 'https://dog.ceo/api/breeds/image/random';

//get center card title
const postTitle = document.querySelector('#card-title');
//get center card img
const postImg = document.querySelector("#card-image");
//get center card likes
const postLikes = document.querySelector("#like-count");
//get center card like button
const likeBtn = document.querySelector("#like-button");
//get comments list (it's unordered!)
const commentList = document.querySelector('#comments-list');
//get form for entering new comment
const newCommentForm = document.querySelector('#comment-form');
//global variables
let imgId = 0;

//images fetch request function
const fetchPostImg = async () => {
    //request from db
    const req = await fetch(imgsUrl);
    //get promise as json
    const res = req.json();
    return res;
}

//comments fetch request function
const fetchPostComments = async () => {
    //request from db
    const req = await fetch(commentsUrl);
    //get promise as json
    const res = req.json();
    return res;
}

//render the post information (NOT COMMENTS)
const renderCard = async () => {
    //fetch information
    const postInfo = await fetchPostImg();
    //we want the initial element
    const card = postInfo[0];
    //set title
    postTitle.textContent = card['title'];
    //set image source
    postImg.src = card['image'];
    //change like count, and account for grammar
    if (card['likes'] === 1){
        postLikes.textContent = `${card['likes']} like`;
    } else {
        postLikes.textContent = `${card['likes']} likes`;
    }
    //update global variable
    imgId = card['id'];
}

//render the comments THIS ALSO HANDLES DELETING COMMENTS ON PRESS
const renderComments = async () => {
    //first clean out comments
    commentList.innerHTML = '';
    //fetch information
    const postComments = await fetchPostComments();
    //iterate through and append, have to use forEach so the iterator doesn't get stuck at the final entry (because fuck me, I guess)
    postComments.forEach(comment => {
        let tempElem = document.createElement('li');
        tempElem.classList.add('comments')
        tempElem.textContent = comment['content'];
        commentList.append(tempElem);

        //DELETION functionality: add event listener for comment press 
        tempElem.addEventListener('click', () => {
            if(confirm('Are you sure you want to delete this comment?')){
                //delete request to get it out of the DB
                fetch(`${commentsUrl}/${comment['id']}`,{
                    method: 'DELETE',
                }).then ((response) => {
                    //delete comment visually (this way, renderComments() is not called recursively
                    tempElem.remove();
                })
            } else {
                //user has indicated they do not want to delete comment
                alert('Comment removal cancelled.');
            }   
        })
    })
}

//functionality for like button
likeBtn.addEventListener('click', async (event) => {
    //fetch information
    const postInfo = await fetchPostImg();
    //we want the initial element
    const card = postInfo[0];
    //get the number of likes currently and increment by 1
    const currLikes = card['likes'] + 1;
    //http request
    let updateLikes = await fetch(`${imgsUrl}/${imgId}`, {
        //patch new likes
        method: 'PATCH',
        body: JSON.stringify({
            //set likes
            'likes': currLikes,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    //re-render card at end of patch process
    return renderCard();
})

//new comment form functionality
newCommentForm.addEventListener('submit', async (event) => {
    //stop default
    event.preventDefault();
    //get user input
    let userInput = newCommentForm['comment'].value;
    //make sure user input isn't empty
    if(userInput != ''){
        //post that shit into the db
        let addNew = await fetch('http://localhost:3000/comments/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageId: imgId,
                content: userInput
        }),
    })
    } else {
        alert('Invalid input, please type something!')
    }
    //clear entry
    newCommentForm['comment'].value = '';
    //re-render comments
    renderComments();
})

//toggle viewing the post image
postTitle.addEventListener('click', () => {
    //check to see if the img is already hidden
    if(!postImg.classList.contains('hidden')){
        //image is not hidden, so make it hidden
        postImg.classList.add('hidden');
    } else {
        //hide the image
        postImg.classList.remove('hidden');
    }
})

//change img to rando doggo 
postImg.addEventListener('click', async() => {
    //generate random img url
    const req = await fetch(randoDogUrl);
    //convert to json
    const res = await req.json();
    //save url into var
    const newImgUrl = res['message'];
    console.log(newImgUrl);
    //change src of img to new url
    postImg.src = newImgUrl;

    //return the patch
    return fetch(`${imgsUrl}/${imgId}`, {
        //patch new img url
        method: 'PATCH',
        body: JSON.stringify({
            //edit url
            'image': newImgUrl,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
});

renderCard();
renderComments();