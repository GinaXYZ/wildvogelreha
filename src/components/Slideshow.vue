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

  <style>
.slideshow {
  margin-top: 10rem;
  position: relative;
  width: 100%;
  max-width: 600px;
  height: auto;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  margin-bottom: 2rem;
}
.slides {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.slide {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
.aboutSlides {
  width: 100%;
  height: 400px;
  display: flex;
  margin: 0px auto;
  justify-content: center;
  text-align: center;
  align-items: center;
  position: relative;
}
  
button.prev,
button.next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  font-size: 2rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  z-index: 10;
}

button.prev {
  left: 10px;
}
button.next {
  right: 10px;
}
.dots {
  text-align: center;
  margin-top: 10px;
}

.dots span {
  display: inline-block;
  height: 10px;
  width: 10px;
  margin: 0 5px;
  background-color: #bbb;
  border-radius: 50%;
  cursor: pointer;
}

.dots .active {
  background-color: #0c4b47;
}
.news-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  border-radius: 0 0 8px 8px;
  box-sizing: border-box;
}

.news-scroll {
  max-height: 100%;
  overflow-y: auto;
}

.news-text {
  font-size: 1rem;
  color: #0c4b47;
  font-family: 'Helvetica', sans-serif;
  margin: 0;
}

.slideshow-outer {
  position: center;          
  display: flex;
  justify-content: center;   
  align-items: center;                    
}

/* ===== Responsive Slideshow ===== */
@media (max-width: 768px) {
  .slideshow {
    margin-top: 2rem;
    max-width: 100%;
  }
  
  button.prev,
  button.next {
    font-size: 1.5rem;
    padding: 0.4rem 0.8rem;
  }
  
  button.prev {
    left: 5px;
  }
  
  button.next {
    right: 5px;
  }
  
  .news-text {
    font-size: 0.9rem;
  }
  
  .news-overlay {
    padding: 0.8rem;
  }
}

@media (max-width: 480px) {
  .slideshow {
    margin-top: 1rem;
  }
  
  button.prev,
  button.next {
    font-size: 1.2rem;
    padding: 0.3rem 0.6rem;
  }
  
  .dots span {
    height: 8px;
    width: 8px;
    margin: 0 3px;
  }
  
  .news-text {
    font-size: 0.85rem;
  }
}
</style>
  
