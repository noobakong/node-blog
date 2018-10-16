$.ajax({
  type: 'get',
  url: 'api/comment/post',
  data: {
    contentid: $('#contentId').val(),
  },
  success: ((responseData) => {
    renderComment(responseData.data)
  })
})


// 提交评论
$('#commentBtn').on('click',function() {
  $.ajax({
    type: 'post',
    url: 'api/comment/post',
    data: {
      contentid: $('#contentId').val(),
      content: $('#commentContent').val()
    },
    success: ((responseData) => {
      $('#commentContent').val('')
      renderComment(responseData.data.comments)
    })
  })
})

function renderComment (comments) {
  var html = ''
  for (var i = 0; i< comments.length; i++) {
    html += `
      <li>
          <p class="discuss_user"><span>${comments[i].username}</span><i>发表于 ${comments[i].postTime}</i></p>
          <div class="discuss_userMain">
              ${comments[i].content}
          </div>
      </li>
    `
  }

  $('.discuss_list').html(html)
}