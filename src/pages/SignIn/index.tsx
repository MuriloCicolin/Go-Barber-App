import React, { useCallback, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  View,
  ScrollView,
  TextInput,
  Alert,
  Text,
  ActivityIndicator,
} from 'react-native';

import * as Yup from 'yup';

import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import { FormHandles } from '@unform/core';
import { Form } from '@unform/mobile';
import { useAuth } from '../../hooks/auth';

import logoImg from '../../assets/logo.png';

import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  Container,
  Title,
  ForgotPassword,
  ForgotPasswordText,
  CreateAccountButton,
  CreateAccountButtonText,
} from './styles';

import getValidationErrors from '../../utils/getValidationErrors';

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn: React.FC<FormHandles> = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const formRef = useRef<FormHandles>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const navigation = useNavigation();

  const { signIn } = useAuth();

  const handleSignIn = useCallback(
    async (data: SignInFormData) => {
      try {
        formRef.current?.setErrors({});
        setLoading(true);

        const schema = Yup.object().shape({
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail válido'),
          password: Yup.string().required().min(6, 'Senha obrigatória'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        await signIn({
          email: data.email,
          password: data.password,
        });
        setLoading(false);
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert(
          'Erro na autenticação',
          'Ocorreu um erro ao fazer o login, cheque as crendeciais',
        );
      }
      setLoading(false);
    },
    [signIn],
  );

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}
        >
          <Container>
            <Image source={logoImg} />
            <View>
              <Title>Faça seu Logon</Title>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#ff9000" />
            ) : (
              <>
                <Form ref={formRef} onSubmit={handleSignIn}>
                  <Input
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    name="email"
                    icon="mail"
                    placeholder="E-mail"
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      passwordInputRef.current?.focus();
                    }}
                  />

                  <Input
                    ref={passwordInputRef}
                    name="password"
                    icon="lock"
                    placeholder="Senha"
                    secureTextEntry
                    returnKeyType="send"
                    onSubmitEditing={() => {
                      formRef.current?.submitForm();
                    }}
                  />

                  <Button
                    onPress={() => {
                      formRef.current?.submitForm();
                    }}
                  >
                    Entrar
                  </Button>
                </Form>
              </>
            )}

            <ForgotPassword onPress={() => {}}>
              <ForgotPasswordText>Esqueci minha senha</ForgotPasswordText>
            </ForgotPassword>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>

      <CreateAccountButton onPress={() => navigation.navigate('SignUp')}>
        <Icon name="log-in" size={20} color="#ff9000" />
        <CreateAccountButtonText>Criar uma conta</CreateAccountButtonText>
      </CreateAccountButton>
    </>
  );
};

export default SignIn;
