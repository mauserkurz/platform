import { mount } from '@vue/test-utils';
import DisplayWrap from '@/components/DisplayWrap/DisplayWrap.vue';

describe('component DisplayWrap', () => {
  describe('rendering', () => {
    it('should render html', () => {
      const wrapper = mount(DisplayWrap);

      expect(wrapper.html()).toMatchSnapshot();
    });
  });
});