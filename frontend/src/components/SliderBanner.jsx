import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useApiStore } from "../store/apiStore";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";

export default function SliderBanner() {
  const { sliders, fetchSliders } = useApiStore();

  useEffect(() => {
    fetchSliders().catch(() => {});
  }, [fetchSliders]);

  const mainSlides = (sliders || [])
    .filter((s) => (s.order ?? 0) < 100)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (!mainSlides.length) return null;

  return (
    <div className="w-full overflow-hidden rounded-xl shadow-md bg-green-50">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop
        // pagination={{ clickable: true }}
        className="rounded-xl"
      >
        {mainSlides.map((slide) => (
          <SwiperSlide key={slide._id}>
            {slide.link ? (
              slide.link.startsWith("/") ? (
                <Link to={slide.link} className="block">
                  <img
                    src={slide.image}
                    alt={
                      slide.title || "Banner khuyến mãi từ Hiệu Sách Mỹ Hạnh"
                    }
                    loading="lazy"
                    className="w-full h-48 md:h-72 object-cover object-center"
                  />
                </Link>
              ) : (
                <a
                  href={slide.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={slide.image}
                    alt={
                      slide.title || "Banner khuyến mãi từ Hiệu Sách Mỹ Hạnh"
                    }
                    loading="lazy"
                    className="w-full h-48 md:h-72 object-cover object-center"
                  />
                </a>
              )
            ) : (
              <img
                src={slide.image}
                alt={slide.title || "Banner khuyến mãi từ Hiệu Sách Mỹ Hạnh"}
                loading="lazy"
                className="w-full h-48 md:h-72 object-cover object-center"
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
