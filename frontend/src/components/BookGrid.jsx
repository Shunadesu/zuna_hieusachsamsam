import BookCard from './BookCard';

export default function BookGrid({ books, promotions = [] }) {
  const now = new Date();
  const activePromotions = promotions.filter((p) => {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    return now >= start && now <= end;
  });
  const bookIdToPromo = {};
  activePromotions.forEach((p) => {
    (p.bookIds || []).forEach((b) => {
      if (b._id) bookIdToPromo[b._id] = p;
    });
  });

  const getBookPrice = (book) => {
    const promo = bookIdToPromo[book._id];
    const basePrice = Number(book.price || 0);
    const baseOriginal = Number(book.originalPrice || 0);
    let display = basePrice;
    let original = baseOriginal > basePrice ? baseOriginal : null;

    if (promo) {
      original = basePrice;
      if (promo.type === 'percent') {
        display = Math.round(basePrice * (1 - promo.value / 100));
      } else if (promo.type === 'fixed') {
        display = Math.max(0, basePrice - promo.value);
      }
    }

    if (original == null || original <= display) {
      return { display, original: null };
    }
    return { display, original };
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map((book) => {
        const { display, original } = getBookPrice(book);
        return (
          <BookCard
            key={book._id}
            book={book}
            originalPrice={original}
            discountPrice={original != null ? display : undefined}
          />
        );
      })}
    </div>
  );
}
