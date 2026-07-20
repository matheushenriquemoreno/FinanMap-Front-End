import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import UserAvatar from 'src/components/UserAvatar.vue';

describe('UserAvatar', () => {
  it('renderiza o avatar normalizado e o texto alternativo recebido', () => {
    const wrapper = mount(UserAvatar, {
      props: { avatarId: 'avatar-03', alt: 'Avatar de Ana' },
      global: {
        stubs: {
          QAvatar: { props: ['size'], template: '<div class="q-avatar-stub"><slot /></div>' },
        },
      },
    });

    const image = wrapper.get('img');
    expect(image.attributes('src')).toContain('/avatars/avatar-03.svg');
    expect(image.attributes('alt')).toBe('Avatar de Ana');
  });
});
