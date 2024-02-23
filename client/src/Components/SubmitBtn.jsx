import { Button, Spinner, useColorMode } from '@chakra-ui/react';
import { useNavigation } from 'react-router-dom';

const SubmitBtn = () => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <Button
      style={{
        background: useColorMode('gray.800', 'gray.700'),
      }}
      type='submit'
      className={`btn btn-block`}
      isDisabled={isSubmitting}
    >
      {isSubmitting ? <Spinner /> : 'submit'}
    </Button>
  );
};

export default SubmitBtn;
