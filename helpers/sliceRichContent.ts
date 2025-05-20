export function sliceRichContent(content: string, limit = 5000) {
  let initialSlice = content.slice(0, limit);

  const imgIndex = initialSlice.indexOf('<img');
  const mockImageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNK7-n-r_w_qCEIjsnu8VXMBamUkSmLUr9Eg&s';

  if (imgIndex !== -1) {
    return initialSlice.slice(0, imgIndex) + `<img src=${mockImageUrl} />`;
  }

  return initialSlice;
}
