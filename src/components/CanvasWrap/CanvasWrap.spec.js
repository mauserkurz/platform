import { mount } from '@vue/test-utils';
import CanvasWrap from '@/components/CanvasWrap/CanvasWrap.vue';

describe('component CanvasWrap', () => {
  describe('rendering', () => {
    it('should render html', () => {
      const wrapper = mount(CanvasWrap);

      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});
