var limit = 4
var page = 1
var pages = 0
var comments = []

// 加载所有评论
$.ajax({
  type: 'get',
  url: 'api/comment/post',
  data: {
    contentid: $('#contentId').val(),
  },
  success: ((responseData) => {
    comments = responseData.data
    renderComment()
  })
})

$('.pager').delegate('a', 'click', function() {
  if ($(this).parent().hasClass('previous')) {
    page--
  } else {
    page++
  }
  renderComment()
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
      comments = responseData.data.comments
      renderComment(true)
    })
  })
})

function renderComment (toLaster) {
  $('#discuss_count').html(comments.length)

  var $lis = $('.pager li')
  var pages = Math.ceil(comments.length / limit)
  if (!toLaster) {
    var start = (page-1) * limit
  } else {
    var start = (pages - 1) * limit
  }
  var end = (start + limit) > comments.length ? Math.max(1,comments.length) : (start + limit)


  $lis.eq(1).html(page + '/' + pages )

  if (page <= 1) {
    page = 1
    $lis.eq(0).html('<span>已是最前一页</span>')
  } else {
    $lis.eq(0).html('<a href="javacript:void(0);">上一页</a>')
  }

  if (page >= pages) {
    page = pages
    $lis.eq(2).html('<span>已是最后一页</span>')
  } else {
    $lis.eq(2).html('<a href="javacript:void(0);">下一页</a>')
  }

  var html = ''
  for (var i = start; i < end; i++) {
    html += `
      <li>
          <p class="discuss_user"><span>${comments[i].username}</span><i>发表于 ${formatDate(comments[i].postTime)}</i></p>
          <div class="discuss_userMain">
              ${comments[i].content}
          </div>
      </li>
    `
  }

  $('.discuss_list').html(html)
}

function formatDate(d) {
  var date1 = new Date(d)
  return date1.getFullYear() + '年' + (date1.getMonth()+1) + '月' + date1.getDate() + '日' + date1.getHours() + ':' + date1.getMinutes() + ':' + date1.getSeconds()
}