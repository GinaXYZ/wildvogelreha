<script setup>
import { ref, defineProps } from 'vue';

const props = defineProps({
  slides: {
    type: Array,
    required: true,
  },
});
const slides = props.slides;

const currentIndex = ref(0);

const next = () => {
  if (slides && slides.length > 0) {
    currentIndex.value = (currentIndex.value + 1) % slides.length;
  }
};

const prev = () => {
  if (slides && slides.length > 0) {
    currentIndex.value = (currentIndex.value - 1 + slides.length) % slides.length;
  }
};

const goToSlide = (index) => {
  if (slides.length > 0) {
    currentIndex.value = index;
  }
};
</script>

<template>
  <div class="slideshow">
    <div class="slides">
      <img :src="slides[currentIndex].image" class="slide" alt="Diashow Bild" />
      <div class="news-overlay">
        <p class="news-text">{{ slides[currentIndex].news }}</p>
      </div>
    </div>
    <button class="prev" @click="prev">&#10094;</button>
    <button class="next" @click="next">&#10095;</button>
    <div class="dots">
      <span
        v-for="(slide, index) in slides"
        :key="index"
        :class="{ active: index === currentIndex }"
        @click="goToSlide(index)"
      ></span>
    </div>
  </div>
</template>

  <style scoped>
.slideshow {
  position: relative;
  width: 100%;
  max-width: 600px;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.slides {
  width: 100%;
  height: 100%;
  position: relative;
}

.slide {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

button.prev,
button.next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  font-size: 1.8rem;
  padding: 0.6rem 1rem;
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  z-index: 10;
  transition: background 0.2s;
}

button.prev:hover,
button.next:hover {
  background: rgba(0, 0, 0, 0.6);
}

button.prev {
  left: 10px;
}

button.next {
  right: 10px;
}

.dots {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 10;
}

.dots span {
  display: inline-block;
  height: 10px;
  width: 10px;
  margin: 0 5px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dots span:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.dots .active {
  background-color: #0c4b47;
}

.news-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.8rem 1rem;
  border-radius: 0 0 12px 12px;
  box-sizing: border-box;
}

.news-text {
  font-size: 0.95rem;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
  margin: 0;
  line-height: 1.4;
}

/* ===== TABLET (768px) ===== */
@media (max-width: 768px) {
  .slideshow {
    max-width: 100%;
    border-radius: 8px;
  }
  
  button.prev,
  button.next {
    font-size: 1.4rem;
    padding: 0.5rem 0.8rem;
  }
  
  button.prev {
    left: 8px;
  }
  
  button.next {
    right: 8px;
  }
  
  .news-text {
    font-size: 0.9rem;
  }
  
  .news-overlay {
    padding: 0.7rem;
    border-radius: 0 0 8px 8px;
  }
}

/* ===== MOBILE (480px) ===== */
@media (max-width: 480px) {
  button.prev,
  button.next {
    font-size: 1.2rem;
    padding: 0.4rem 0.6rem;
  }
  
  button.prev {
    left: 5px;
  }
  
  button.next {
    right: 5px;
  }
  
  .dots span {
    height: 8px;
    width: 8px;
    margin: 0 3px;
  }
  
  .dots {
    bottom: 40px;
  }
  
  .news-text {
    font-size: 0.85rem;
  }
  
  .news-overlay {
    padding: 0.6rem;
  }
}
</style>
  
