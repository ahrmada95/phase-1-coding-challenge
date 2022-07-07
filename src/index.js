//urls
const imgsUrl = 'http://localhost:3000/images/';
const commentsUrl = 'http://localhost:3000/comments/';

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

//render the comments
const renderComments = async () => {
    //first clean out comments
    commentList.innerHTML = '';
    //fetch information
    const postComments = await fetchPostComments();
    //iterate through and append
    for(comment of postComments) {
        let tempElem = document.createElement('li');
        tempElem.classList.add('comments')
        tempElem.textContent = comment['content'];
        commentList.append(tempElem);
    }
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
    let updateLikes = await fetch(`${imgsUrl}/1`, {
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
    // //check for valid input and then post
    // if(userInput != ''){
    //     let newComment = document.createElement('li');
    //     newComment.classList.add('comments');
    //     newComment.textContent = userInput;
    //     commentList.append(newComment);
    // } else {
    //     alert('invalid entry')
    // }
    //check if blank string
    
    let commentObj = {
        'imageId': imgId,
        'content': userInput,
    }
    let newEntryDb = JSON.stringify(commentObj);

    let addNew = await fetch('http://localhost:3000/comments/', {
        method: "POST",
        header: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            "id": 4,
            "imageId": 1,
            "content": "fuck this shit what the fuck"
        }),
    })
    //clear entry
    newCommentForm['comment'].value = '';
})

renderCard();
renderComments();