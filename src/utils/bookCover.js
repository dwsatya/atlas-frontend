// Katalog belum menyimpan sampul; field ini disiapkan bila backend menambahkannya nanti
export const getBookCoverUrl = (book) => book?.cover_url || book?.cover_image || null
