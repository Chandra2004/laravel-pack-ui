import DefaultTheme from 'vitepress/theme';
import Alert from '../../../resources/js/Components/Pack/Alert.vue';
import AutoSaveStatus from '../../../resources/js/Components/Pack/AutoSaveStatus.vue';
import Avatar from '../../../resources/js/Components/Pack/Avatar.vue';
import AvatarGroup from '../../../resources/js/Components/Pack/AvatarGroup.vue';
import Badge from '../../../resources/js/Components/Pack/Badge.vue';
import ToastNotification from '../../../resources/js/Components/Pack/ToastNotification.vue';
import TagInput from '../../../resources/js/Components/Pack/TagInput.vue';
import Breadcrumb from '../../../resources/js/Components/Pack/Breadcrumb.vue';
import ButtonSubmit from '../../../resources/js/Components/Pack/ButtonSubmit.vue';
import ButtonTheme from '../../../resources/js/Components/Pack/ButtonTheme.vue';
import Card from '../../../resources/js/Components/Pack/Card.vue';
import CartDrawer from '../../../resources/js/Components/Pack/CartDrawer.vue';
import CtaButton from '../../../resources/js/Components/Pack/CtaButton.vue';
import Rating from '../../../resources/js/Components/Pack/Rating.vue';
import ScrollProgress from '../../../resources/js/Components/Pack/ScrollProgress.vue';
import Skeleton from '../../../resources/js/Components/Pack/Skeleton.vue';
import Dropdown from '../../../resources/js/Components/Pack/Dropdown.vue';
import Modal from '../../../resources/js/Components/Pack/Modal.vue';
import Sidebar from '../../../resources/js/Components/Pack/Sidebar.vue';
import Tabs from '../../../resources/js/Components/Pack/Tabs.vue';
import Stepper from '../../../resources/js/Components/Pack/Stepper.vue';
import InputField from '../../../resources/js/Components/Pack/InputField.vue';
import InputRepeater from '../../../resources/js/Components/Pack/InputRepeater.vue';
import FileDropzone from '../../../resources/js/Components/Pack/FileDropzone.vue';
import LocationPicker from '../../../resources/js/Components/Pack/LocationPicker.vue';
import RichTextEditor from '../../../resources/js/Components/Pack/RichTextEditor.vue';
import TableComponent from '../../../resources/js/Components/Pack/TableComponent.vue';
import Pagination from '../../../resources/js/Components/Pack/Pagination.vue';
import FilterToolbar from '../../../resources/js/Components/Pack/FilterToolbar.vue';
import DragDrop from '../../../resources/js/Components/Pack/DragDrop.vue';
import ProductGallery from '../../../resources/js/Components/Pack/ProductGallery.vue';
import MediaPlayer from '../../../resources/js/Components/Pack/MediaPlayer.vue';
import Mermaid from './components/Mermaid.vue';

import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // UI Components
    app.component('Alert', Alert);
    app.component('AutoSaveStatus', AutoSaveStatus);
    app.component('Avatar', Avatar);
    app.component('AvatarGroup', AvatarGroup);
    app.component('Badge', Badge);
    app.component('ToastNotification', ToastNotification);
    app.component('TagInput', TagInput);
    app.component('Breadcrumb', Breadcrumb);
    app.component('ButtonSubmit', ButtonSubmit);
    app.component('ButtonTheme', ButtonTheme);
    app.component('Card', Card);
    app.component('CartDrawer', CartDrawer);
    app.component('CtaButton', CtaButton);
    app.component('Rating', Rating);
    app.component('ScrollProgress', ScrollProgress);
    app.component('Skeleton', Skeleton);
    app.component('Dropdown', Dropdown);
    app.component('Modal', Modal);
    app.component('Sidebar', Sidebar);
    app.component('Tabs', Tabs);
    app.component('Stepper', Stepper);
    app.component('InputField', InputField);
    app.component('InputRepeater', InputRepeater);
    app.component('FileDropzone', FileDropzone);
    app.component('LocationPicker', LocationPicker);
    app.component('RichTextEditor', RichTextEditor);
    app.component('TableComponent', TableComponent);
    app.component('Pagination', Pagination);
    app.component('FilterToolbar', FilterToolbar);
    app.component('DragDrop', DragDrop);
    app.component('ProductGallery', ProductGallery);
    app.component('MediaPlayer', MediaPlayer);
    app.component('Mermaid', Mermaid);
  },
  setup() {
    if (typeof window !== 'undefined') {
      // Jika pengguna berada pada port dev server VitePress (5174) dan mengakses rute /preview
      if (window.location.port === '5174' && window.location.pathname.startsWith('/preview')) {
        window.location.replace(`http://${window.location.hostname}:8000${window.location.pathname}${window.location.search}`);
      }

      // Intersep klik pada tautan /preview untuk diarahkan ke Laravel port 8000 saat di port 5174
      window.addEventListener('click', (event) => {
        const anchor = event.target.closest('a');
        if (anchor && window.location.port === '5174') {
          const href = anchor.getAttribute('href');
          if (href && (href.startsWith('/preview') || href === '/preview')) {
            event.preventDefault();
            window.location.href = `http://${window.location.hostname}:8000${href}`;
          }
        }
      }, true);
    }
  },
};
